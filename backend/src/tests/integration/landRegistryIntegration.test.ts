import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../app';
import { DatabaseService } from '../../services/databaseService';
import { LandRegistryService } from '../../services/landRegistryService';
import { RoyalMailPAFService } from '../../services/royalMailPAFService';
import { PropertyOwnership, PriceHistoryEntry } from '../../types/landRegistry';
import { PAFAddress } from '../../types/royalMail';

describe('Land Registry Integration Tests', () => {
  let dbService: DatabaseService;
  let landRegistryService: LandRegistryService;
  let pafService: RoyalMailPAFService;

  beforeAll(async () => {
    // Initialize test database connection
    dbService = new DatabaseService();
    await dbService.connect();
    
    // Initialize services
    landRegistryService = new LandRegistryService(dbService);
    pafService = new RoyalMailPAFService();
  });

  afterAll(async () => {
    // Clean up database connection
    await dbService.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await dbService.query('DELETE FROM land_registry_ownership WHERE uprn LIKE \'test_%\'');
    await dbService.query('DELETE FROM land_registry_price_history WHERE uprn LIKE \'test_%\'');
    await dbService.query('DELETE FROM land_registry_transactions WHERE uprn LIKE \'test_%\'');
  });

  afterEach(async () => {
    // Clean up test data after each test
    await dbService.query('DELETE FROM land_registry_ownership WHERE uprn LIKE \'test_%\'');
    await dbService.query('DELETE FROM land_registry_price_history WHERE uprn LIKE \'test_%\'');
    await dbService.query('DELETE FROM land_registry_transactions WHERE uprn LIKE \'test_%\'');
  });

  describe('PAF and Land Registry Integration', () => {
    it('should integrate PAF address lookup with Land Registry data', async () => {
      // First, insert test data
      const testUprn = 'test_12345678';
      const testAddress: PAFAddress = {
        uprn: testUprn,
        addressLine1: '123 Test Street',
        addressLine2: '',
        locality: 'Test Area',
        townName: 'London',
        postcode: 'SW1A 1AA',
        county: 'Greater London',
        country: 'England'
      };

      const testOwnership: PropertyOwnership = {
        propertyId: 'test_prop_123',
        uprn: testUprn,
        address: {
          line1: testAddress.addressLine1,
          line2: testAddress.addressLine2 || '',
          city: testAddress.townName,
          postcode: testAddress.postcode,
          county: testAddress.county
        },
        currentOwners: [{
          name: 'Test Owner',
          type: 'individual',
          registrationDate: '2020-01-15',
          share: '100%'
        }],
        tenure: 'freehold',
        titleNumber: 'TEST123456',
        registrationDate: '2020-01-15',
        lastUpdated: new Date().toISOString()
      };

      // Insert test ownership data
      await dbService.query(`
        INSERT INTO land_registry_ownership (
          property_id, uprn, address_line1, address_line2, city, postcode, county,
          current_owners, tenure, title_number, registration_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        testOwnership.propertyId,
        testOwnership.uprn,
        testOwnership.address.line1,
        testOwnership.address.line2,
        testOwnership.address.city,
        testOwnership.address.postcode,
        testOwnership.address.county,
        JSON.stringify(testOwnership.currentOwners),
        testOwnership.tenure,
        testOwnership.titleNumber,
        testOwnership.registrationDate,
        testOwnership.lastUpdated
      ]);

      // Test the integrated endpoint
      const response = await request(app)
        .get(`/api/properties/integrated/${testUprn}`)
        .expect(200);

      expect(response.body).toHaveProperty('pafData');
      expect(response.body).toHaveProperty('landRegistryData');
      expect(response.body.landRegistryData.uprn).toBe(testUprn);
      expect(response.body.landRegistryData.currentOwners[0].name).toBe('Test Owner');
    });

    it('should handle postcode-based property search with Land Registry enrichment', async () => {
      const testPostcode = 'SW1A 1AA';
      const testUprn1 = 'test_11111111';
      const testUprn2 = 'test_22222222';

      // Insert test price history data
      await dbService.query(`
        INSERT INTO land_registry_price_history (
          id, uprn, sale_date, price, property_type, tenure, new_build,
          address_line1, city, postcode, county
        ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
        ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `, [
        'test_ph_1', testUprn1, '2023-06-15', 450000, 'terraced', 'freehold', false,
        '123 Test Street', 'London', testPostcode, 'Greater London',
        'test_ph_2', testUprn2, '2023-08-20', 520000, 'semi-detached', 'freehold', false,
        '456 Test Avenue', 'London', testPostcode, 'Greater London'
      ]);

      const response = await request(app)
        .get(`/api/properties/postcode/${testPostcode}`)
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(response.body.properties).toHaveLength(2);
      expect(response.body.properties[0]).toHaveProperty('priceHistory');
      expect(response.body.properties[1]).toHaveProperty('priceHistory');
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency between PAF and Land Registry', async () => {
      const testUprn = 'test_33333333';
      const testPostcode = 'SW1B 2BB';

      // Insert ownership data
      await dbService.query(`
        INSERT INTO land_registry_ownership (
          property_id, uprn, address_line1, city, postcode, county,
          current_owners, tenure, title_number, registration_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        'test_prop_333',
        testUprn,
        '789 Consistency Street',
        'London',
        testPostcode,
        'Greater London',
        JSON.stringify([{ name: 'Consistent Owner', type: 'individual', registrationDate: '2021-03-10', share: '100%' }]),
        'leasehold',
        'TEST789',
        '2021-03-10',
        new Date().toISOString()
      ]);

      // Insert price history
      await dbService.query(`
        INSERT INTO land_registry_price_history (
          id, uprn, sale_date, price, property_type, tenure, new_build,
          address_line1, city, postcode, county
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        'test_ph_3', testUprn, '2021-03-10', 380000, 'flat', 'leasehold', false,
        '789 Consistency Street', 'London', testPostcode, 'Greater London'
      ]);

      // Test ownership endpoint
      const ownershipResponse = await request(app)
        .get(`/api/land-registry/ownership/${testUprn}`)
        .expect(200);

      // Test price history endpoint
      const priceResponse = await request(app)
        .get(`/api/land-registry/price-history/${testUprn}`)
        .expect(200);

      // Verify data consistency
      expect(ownershipResponse.body.uprn).toBe(testUprn);
      expect(ownershipResponse.body.address.postcode).toBe(testPostcode);
      expect(priceResponse.body[0].uprn).toBe(testUprn);
      expect(priceResponse.body[0].address.postcode).toBe(testPostcode);
      
      // Verify tenure consistency
      expect(ownershipResponse.body.tenure).toBe('leasehold');
      expect(priceResponse.body[0].tenure).toBe('leasehold');
    });

    it('should handle missing Land Registry data gracefully', async () => {
      const nonExistentUprn = 'test_99999999';

      const response = await request(app)
        .get(`/api/land-registry/ownership/${nonExistentUprn}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk operations efficiently', async () => {
      const testPostcode = 'SW1C';
      const batchSize = 100;
      
      // Insert bulk test data
      const insertPromises = [];
      for (let i = 0; i < batchSize; i++) {
        const uprn = `test_bulk_${i.toString().padStart(8, '0')}`;
        insertPromises.push(
          dbService.query(`
            INSERT INTO land_registry_price_history (
              id, uprn, sale_date, price, property_type, tenure, new_build,
              address_line1, city, postcode, county
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            `test_bulk_ph_${i}`, uprn, '2023-01-01', 300000 + (i * 1000), 'terraced', 'freehold', false,
            `${i} Bulk Test Street`, 'London', `${testPostcode} ${Math.floor(i/10)}AA`, 'Greater London'
          ])
        );
      }
      
      await Promise.all(insertPromises);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/land-registry/bulk-search')
        .send({ postcode: testPostcode })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('results');
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should cache frequently accessed data', async () => {
      const testUprn = 'test_cache_12345678';
      
      // Insert test data
      await dbService.query(`
        INSERT INTO land_registry_ownership (
          property_id, uprn, address_line1, city, postcode, county,
          current_owners, tenure, title_number, registration_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        'test_cache_prop',
        testUprn,
        '123 Cache Street',
        'London',
        'SW1D 1DD',
        'Greater London',
        JSON.stringify([{ name: 'Cache Owner', type: 'individual', registrationDate: '2022-01-01', share: '100%' }]),
        'freehold',
        'CACHE123',
        '2022-01-01',
        new Date().toISOString()
      ]);

      // First request (should hit database)
      const startTime1 = Date.now();
      await request(app)
        .get(`/api/land-registry/ownership/${testUprn}`)
        .expect(200);
      const firstRequestTime = Date.now() - startTime1;

      // Second request (should hit cache)
      const startTime2 = Date.now();
      await request(app)
        .get(`/api/land-registry/ownership/${testUprn}`)
        .expect(200);
      const secondRequestTime = Date.now() - startTime2;

      // Cache should make second request faster
      expect(secondRequestTime).toBeLessThan(firstRequestTime);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection failures gracefully', async () => {
      // Temporarily close database connection
      await dbService.disconnect();

      const response = await request(app)
        .get('/api/land-registry/ownership/12345678')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('database');

      // Reconnect for cleanup
      await dbService.connect();
    });

    it('should validate UPRN format across all endpoints', async () => {
      const invalidUprns = ['invalid', '123', 'abcdefgh', ''];

      for (const uprn of invalidUprns) {
        await request(app)
          .get(`/api/land-registry/ownership/${uprn}`)
          .expect(400);

        await request(app)
          .get(`/api/land-registry/price-history/${uprn}`)
          .expect(400);

        await request(app)
          .get(`/api/land-registry/transactions/${uprn}`)
          .expect(400);
      }
    });

    it('should handle concurrent requests safely', async () => {
      const testUprn = 'test_concurrent_12345678';
      
      // Insert test data
      await dbService.query(`
        INSERT INTO land_registry_ownership (
          property_id, uprn, address_line1, city, postcode, county,
          current_owners, tenure, title_number, registration_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        'test_concurrent_prop',
        testUprn,
        '123 Concurrent Street',
        'London',
        'SW1E 1EE',
        'Greater London',
        JSON.stringify([{ name: 'Concurrent Owner', type: 'individual', registrationDate: '2022-06-01', share: '100%' }]),
        'freehold',
        'CONCURRENT123',
        '2022-06-01',
        new Date().toISOString()
      ]);

      // Make multiple concurrent requests
      const concurrentRequests = Array(10).fill(null).map(() => 
        request(app).get(`/api/land-registry/ownership/${testUprn}`)
      );

      const responses = await Promise.all(concurrentRequests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.uprn).toBe(testUprn);
      });
    });
  });

  describe('Data Migration and Sync Tests', () => {
    it('should sync data from external Land Registry API', async () => {
      // This would test the actual sync process
      // For now, we'll test the sync endpoint
      const response = await request(app)
        .post('/api/land-registry/sync')
        .send({ 
          syncType: 'incremental',
          postcode: 'SW1A'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('recordsProcessed');
      expect(response.body).toHaveProperty('syncTime');
    });

    it('should handle data conflicts during sync', async () => {
      const testUprn = 'test_conflict_12345678';
      
      // Insert existing data
      await dbService.query(`
        INSERT INTO land_registry_ownership (
          property_id, uprn, address_line1, city, postcode, county,
          current_owners, tenure, title_number, registration_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        'test_conflict_prop',
        testUprn,
        '123 Conflict Street',
        'London',
        'SW1F 1FF',
        'Greater London',
        JSON.stringify([{ name: 'Original Owner', type: 'individual', registrationDate: '2020-01-01', share: '100%' }]),
        'freehold',
        'CONFLICT123',
        '2020-01-01',
        '2020-01-01T00:00:00Z'
      ]);

      // Simulate sync with newer data
      const response = await request(app)
        .post('/api/land-registry/sync')
        .send({ 
          syncType: 'full',
          uprn: testUprn,
          forceUpdate: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('conflictsResolved');
    });
  });
});