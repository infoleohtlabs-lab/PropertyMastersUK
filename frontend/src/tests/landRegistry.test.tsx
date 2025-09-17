import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PropertyOwnership } from '../components/PropertyOwnership';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { LandRegistryApiService } from '../services/landRegistryApiService';
import { PropertyOwnership as PropertyOwnershipType, PriceHistoryEntry } from '../types/landRegistry';

// Mock the API service
jest.mock('../services/landRegistryApiService');
const mockApiService = LandRegistryApiService as jest.MockedClass<typeof LandRegistryApiService>;

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>
}));

describe('Land Registry Components', () => {
  let apiService: jest.Mocked<LandRegistryApiService>;

  beforeEach(() => {
    apiService = new mockApiService() as jest.Mocked<LandRegistryApiService>;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('PropertyOwnership Component', () => {
    const mockOwnershipData: PropertyOwnershipType = {
      propertyId: 'prop_123',
      uprn: '12345678',
      address: {
        line1: '123 Test Street',
        line2: '',
        city: 'London',
        postcode: 'SW1A 1AA',
        county: 'Greater London'
      },
      currentOwners: [
        {
          name: 'John Smith',
          type: 'individual',
          registrationDate: '2020-01-15',
          share: '100%'
        },
        {
          name: 'Jane Smith',
          type: 'individual',
          registrationDate: '2020-01-15',
          share: '50%'
        }
      ],
      tenure: 'freehold',
      titleNumber: 'LN123456',
      registrationDate: '2020-01-15',
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    it('should render ownership information correctly', () => {
      render(<PropertyOwnership data={mockOwnershipData} />);

      expect(screen.getByText('Property Ownership')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Freehold')).toBeInTheDocument();
      expect(screen.getByText('LN123456')).toBeInTheDocument();
    });

    it('should display multiple owners correctly', () => {
      render(<PropertyOwnership data={mockOwnershipData} />);

      const owners = screen.getAllByText(/Individual/);
      expect(owners).toHaveLength(2);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<PropertyOwnership data={null} loading={true} />);

      expect(screen.getByText('Loading ownership information...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const errorMessage = 'Failed to load ownership data';
      render(<PropertyOwnership data={null} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      render(
        <PropertyOwnership 
          data={null} 
          error="Failed to load" 
          onRetry={mockRetry} 
        />
      );

      fireEvent.click(screen.getByText('Retry'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should format dates correctly', () => {
      render(<PropertyOwnership data={mockOwnershipData} />);

      expect(screen.getByText('15 Jan 2020')).toBeInTheDocument();
    });

    it('should handle missing optional data gracefully', () => {
      const incompleteData = {
        ...mockOwnershipData,
        currentOwners: [{
          name: 'John Smith',
          type: 'individual' as const,
          registrationDate: '2020-01-15'
          // Missing share property
        }]
      };

      render(<PropertyOwnership data={incompleteData} />);
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  describe('PriceHistoryChart Component', () => {
    const mockPriceHistory: PriceHistoryEntry[] = [
      {
        id: 'ph_1',
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
      },
      {
        id: 'ph_2',
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
      }
    ];

    it('should render price history chart correctly', () => {
      render(<PriceHistoryChart data={mockPriceHistory} />);

      expect(screen.getByText('Price History')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should display price statistics', () => {
      render(<PriceHistoryChart data={mockPriceHistory} />);

      expect(screen.getByText('£450,000')).toBeInTheDocument(); // Latest price
      expect(screen.getByText('£380,000')).toBeInTheDocument(); // Previous price
    });

    it('should calculate price change correctly', () => {
      render(<PriceHistoryChart data={mockPriceHistory} />);

      // Should show increase of £70,000 (18.4%)
      expect(screen.getByText(/18.4%/)).toBeInTheDocument();
      expect(screen.getByText(/£70,000/)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<PriceHistoryChart data={[]} loading={true} />);

      expect(screen.getByText('Loading price history...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const errorMessage = 'Failed to load price history';
      render(<PriceHistoryChart data={[]} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle empty data gracefully', () => {
      render(<PriceHistoryChart data={[]} />);

      expect(screen.getByText('No price history available')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      render(
        <PriceHistoryChart 
          data={[]} 
          error="Failed to load" 
          onRetry={mockRetry} 
        />
      );

      fireEvent.click(screen.getByText('Retry'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should format currency correctly', () => {
      render(<PriceHistoryChart data={mockPriceHistory} />);

      // Check that prices are formatted with commas and pound sign
      expect(screen.getByText('£450,000')).toBeInTheDocument();
      expect(screen.getByText('£380,000')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleEntry = [mockPriceHistory[0]];
      render(<PriceHistoryChart data={singleEntry} />);

      expect(screen.getByText('£380,000')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('LandRegistryApiService', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should fetch property ownership successfully', async () => {
      const mockResponse = {
        propertyId: 'prop_123',
        uprn: '12345678',
        currentOwners: [{
          name: 'John Smith',
          type: 'individual',
          registrationDate: '2020-01-15',
          share: '100%'
        }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const service = new LandRegistryApiService();
      const result = await service.getPropertyOwnership('12345678');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/land-registry/ownership/12345678')
      );
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const service = new LandRegistryApiService();
      
      await expect(service.getPropertyOwnership('99999999'))
        .rejects
        .toThrow('Failed to fetch property ownership');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const service = new LandRegistryApiService();
      
      await expect(service.getPropertyOwnership('12345678'))
        .rejects
        .toThrow('Network error');
    });

    it('should fetch price history with date filters', async () => {
      const mockResponse = [
        {
          id: 'ph_1',
          uprn: '12345678',
          saleDate: '2023-06-15',
          price: 450000
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const service = new LandRegistryApiService();
      const result = await service.getPriceHistory('12345678', {
        fromDate: '2023-01-01',
        toDate: '2023-12-31'
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fromDate=2023-01-01&toDate=2023-12-31')
      );
    });

    it('should perform bulk search by postcode', async () => {
      const mockResponse = {
        results: [
          {
            uprn: '12345678',
            address: '123 Test Street, London, SW1A 1AA',
            currentValue: 450000
          }
        ],
        totalCount: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const service = new LandRegistryApiService();
      const result = await service.bulkSearchByPostcode('SW1A');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/land-registry/bulk-search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ postcode: 'SW1A' })
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should load and display property data in PropertyDetail page', async () => {
      const mockOwnership = {
        propertyId: 'prop_123',
        uprn: '12345678',
        currentOwners: [{
          name: 'John Smith',
          type: 'individual' as const,
          registrationDate: '2020-01-15',
          share: '100%'
        }],
        tenure: 'freehold',
        titleNumber: 'LN123456'
      };

      const mockPriceHistory = [
        {
          id: 'ph_1',
          uprn: '12345678',
          saleDate: '2023-06-15',
          price: 450000,
          propertyType: 'terraced' as const,
          tenure: 'freehold' as const,
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

      apiService.getPropertyOwnership.mockResolvedValue(mockOwnership);
      apiService.getPriceHistory.mockResolvedValue(mockPriceHistory);

      render(
        <div>
          <PropertyOwnership data={mockOwnership} />
          <PriceHistoryChart data={mockPriceHistory} />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('£450,000')).toBeInTheDocument();
      });
    });
  });
});