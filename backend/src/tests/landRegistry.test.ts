import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../app';
import { LandRegistryService } from '../services/landRegistryService';
import { PropertyOwnership, PriceHistoryEntry, TransactionRecord } from '../types/landRegistry';

// Mock the LandRegistryService
jest.mock('../services/landRegistryService');
const mockLandRegistryService = LandRegistryService as jest.MockedClass<typeof LandRegistryService>;

describe('Land Registry API Tests', () => {
  let landRegistryService: jest.Mocked<LandRegistryService>;

  beforeEach(() => {
    landRegistryService = new mockLandRegistryService() as jest.Mocked<LandRegistryService>;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Property Ownership Lookup', () => {
    const mockOwnership: PropertyOwnership = {
      propertyId: 'prop_123',
      uprn: '12345678',
      address: {
        line1: '123 Test Street',
        line2: '',
        city: 'London',
        postcode: 'SW1A 1AA',
        county: 'Greater London'
      },
      currentOwners: [{
        name: 'John Smith',
        type: 'individual',
        registrationDate: '2020-01-15',
        share: '100%'
      }],
      tenure: 'freehold',
      titleNumber: 'LN123456',
      registrationDate: '2020-01-15',
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    it('should return property ownership data for valid UPRN', async () => {
      landRegistryService.getPropertyOwnership.mockResolvedValue(mockOwnership);

      const response = await request(app)
        .get('/api/land-registry/ownership/12345678')
        .expect(200);

      expect(response.body).toEqual(mockOwnership);
      expect(landRegistryService.getPropertyOwnership).toHaveBeenCalledWith('12345678');
    });

    it('should return 404 for non-existent UPRN', async () => {
      landRegistryService.getPropertyOwnership.mockResolvedValue(null);

      await request(app)
        .get('/api/land-registry/ownership/99999999')
        .expect(404);

      expect(landRegistryService.getPropertyOwnership).toHaveBeenCalledWith('99999999');
    });

    it('should handle service errors gracefully', async () => {
      landRegistryService.getPropertyOwnership.mockRejectedValue(new Error('Service unavailable'));

      await request(app)
        .get('/api/land-registry/ownership/12345678')
        .expect(500);
    });
  });

  describe('Price History Search', () => {
    const mockPriceHistory: PriceHistoryEntry[] = [
      {
        id: 'ph_1',
        uprn: '12345678',
        saleDate: '2023-06-15',
        price: 450000,
        propertyType: 'terraced',
        tenure: 'freehold',
        newBuild: false,
        address: {
          line1: '123 Test Street',
          line2: '',
          city: 'London',
          postcode: 'SW1A 1AA',
          county: 'Greater London'
        }
      },
      {
        id: 'ph_2',
        uprn: '12345678',
        saleDate: '2020-01-15',
        price: 380000,
        propertyType: 'terraced',
        tenure: 'freehold',
        newBuild: false,
        address: {
          line1: '123 Test Street',
          line2: '',
          city: 'London',
          postcode: 'SW1A 1AA',
          county: 'Greater London'
        }
      }
    ];

    it('should return price history for valid UPRN', async () => {
      landRegistryService.getPriceHistory.mockResolvedValue(mockPriceHistory);

      const response = await request(app)
        .get('/api/land-registry/price-history/12345678')
        .expect(200);

      expect(response.body).toEqual(mockPriceHistory);
      expect(landRegistryService.getPriceHistory).toHaveBeenCalledWith('12345678');
    });

    it('should return empty array for UPRN with no price history', async () => {
      landRegistryService.getPriceHistory.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/land-registry/price-history/99999999')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should support date range filtering', async () => {
      const filteredHistory = [mockPriceHistory[0]];
      landRegistryService.getPriceHistory.mockResolvedValue(filteredHistory);

      const response = await request(app)
        .get('/api/land-registry/price-history/12345678')
        .query({ fromDate: '2023-01-01', toDate: '2023-12-31' })
        .expect(200);

      expect(response.body).toEqual(filteredHistory);
      expect(landRegistryService.getPriceHistory).toHaveBeenCalledWith(
        '12345678',
        { fromDate: '2023-01-01', toDate: '2023-12-31' }
      );
    });
  });

  describe('Bulk Property Search', () => {
    const mockBulkResults = {
      results: [
        {
          uprn: '12345678',
          address: '123 Test Street, London, SW1A 1AA',
          currentValue: 450000,
          lastSaleDate: '2023-06-15',
          lastSalePrice: 450000
        },
        {
          uprn: '87654321',
          address: '456 Another Street, London, SW1B 2BB',
          currentValue: 520000,
          lastSaleDate: '2023-08-20',
          lastSalePrice: 520000
        }
      ],
      totalCount: 2,
      processedCount: 2,
      errors: []
    };

    it('should process bulk search by postcode', async () => {
      landRegistryService.bulkSearchByPostcode.mockResolvedValue(mockBulkResults);

      const response = await request(app)
        .post('/api/land-registry/bulk-search')
        .send({ postcode: 'SW1A' })
        .expect(200);

      expect(response.body).toEqual(mockBulkResults);
      expect(landRegistryService.bulkSearchByPostcode).toHaveBeenCalledWith('SW1A');
    });

    it('should validate postcode format', async () => {
      await request(app)
        .post('/api/land-registry/bulk-search')
        .send({ postcode: 'INVALID' })
        .expect(400);
    });

    it('should require postcode parameter', async () => {
      await request(app)
        .post('/api/land-registry/bulk-search')
        .send({})
        .expect(400);
    });
  });

  describe('Transaction History', () => {
    const mockTransactions: TransactionRecord[] = [
      {
        id: 'txn_1',
        uprn: '12345678',
        transactionDate: '2023-06-15',
        price: 450000,
        transactionType: 'sale',
        propertyType: 'terraced',
        tenure: 'freehold',
        newBuild: false,
        buyers: ['John Smith'],
        sellers: ['Jane Doe'],
        address: {
          line1: '123 Test Street',
          line2: '',
          city: 'London',
          postcode: 'SW1A 1AA',
          county: 'Greater London'
        }
      }
    ];

    it('should return transaction history for valid UPRN', async () => {
      landRegistryService.getTransactionHistory.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get('/api/land-registry/transactions/12345678')
        .expect(200);

      expect(response.body).toEqual(mockTransactions);
      expect(landRegistryService.getTransactionHistory).toHaveBeenCalledWith('12345678');
    });

    it('should support pagination', async () => {
      landRegistryService.getTransactionHistory.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get('/api/land-registry/transactions/12345678')
        .query({ page: '1', limit: '10' })
        .expect(200);

      expect(landRegistryService.getTransactionHistory).toHaveBeenCalledWith(
        '12345678',
        { page: 1, limit: 10 }
      );
    });
  });

  describe('Data Synchronization', () => {
    it('should trigger data sync successfully', async () => {
      landRegistryService.syncData.mockResolvedValue({
        success: true,
        recordsProcessed: 1000,
        errors: [],
        syncTime: '2024-01-15T10:30:00Z'
      });

      const response = await request(app)
        .post('/api/land-registry/sync')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.recordsProcessed).toBe(1000);
      expect(landRegistryService.syncData).toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      landRegistryService.syncData.mockRejectedValue(new Error('Sync failed'));

      await request(app)
        .post('/api/land-registry/sync')
        .expect(500);
    });
  });

  describe('API Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Mock multiple rapid requests
      const promises = Array(101).fill(null).map(() => 
        request(app).get('/api/land-registry/ownership/12345678')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed UPRN', async () => {
      await request(app)
        .get('/api/land-registry/ownership/invalid-uprn')
        .expect(400);
    });

    it('should handle database connection errors', async () => {
      landRegistryService.getPropertyOwnership.mockRejectedValue(
        new Error('Database connection failed')
      );

      await request(app)
        .get('/api/land-registry/ownership/12345678')
        .expect(500);
    });

    it('should return proper error messages', async () => {
      landRegistryService.getPropertyOwnership.mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      const response = await request(app)
        .get('/api/land-registry/ownership/12345678')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('temporarily unavailable');
    });
  });
});