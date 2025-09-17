import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PropertyDetail from '../../pages/PropertyDetail';
import AdminDashboard from '../../pages/dashboards/AdminDashboard';
import { PropertyOwnership, PriceHistoryEntry, TransactionHistory } from '../../types/landRegistry';
import { LandRegistryApiService } from '../../services/landRegistryApiService';

// Mock the API service
jest.mock('../../services/landRegistryApiService');
const mockLandRegistryService = LandRegistryApiService as jest.MockedClass<typeof LandRegistryApiService>;

// Mock data
const mockPropertyOwnership: PropertyOwnership = {
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
      share: '50%'
    },
    {
      name: 'Jane Smith',
      type: 'individual',
      registrationDate: '2020-01-15',
      share: '50%'
    }
  ],
  tenure: 'freehold',
  titleNumber: 'ABC123456',
  registrationDate: '2020-01-15',
  lastUpdated: '2024-01-15T10:00:00Z'
};

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

const mockTransactionHistory: TransactionHistory = {
  uprn: '12345678',
  transactions: [
    {
      id: 'trans_1',
      date: '2023-06-15',
      type: 'sale',
      price: 450000,
      parties: {
        buyer: 'John Smith, Jane Smith',
        seller: 'Previous Owner Ltd'
      },
      documentReference: 'DOC123456',
      registrationDate: '2023-06-20'
    },
    {
      id: 'trans_2',
      date: '2020-01-15',
      type: 'sale',
      price: 380000,
      parties: {
        buyer: 'Previous Owner Ltd',
        seller: 'Original Owner'
      },
      documentReference: 'DOC789012',
      registrationDate: '2020-01-20'
    }
  ],
  totalTransactions: 2,
  lastUpdated: '2024-01-15T10:00:00Z'
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Land Registry E2E Tests', () => {
  let mockServiceInstance: jest.Mocked<LandRegistryApiService>;

  beforeAll(() => {
    // Setup global mocks
    global.fetch = jest.fn();
    
    // Mock window.matchMedia for responsive components
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock service instance
    mockServiceInstance = {
      getPropertyOwnership: jest.fn(),
      getPriceHistory: jest.fn(),
      getTransactionHistory: jest.fn(),
      searchByPostcode: jest.fn(),
      bulkSearch: jest.fn(),
      syncData: jest.fn(),
      getApiStatus: jest.fn(),
      getUsageStats: jest.fn()
    } as jest.Mocked<LandRegistryApiService>;

    // Mock the constructor to return our mock instance
    mockLandRegistryService.mockImplementation(() => mockServiceInstance);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Property Detail Page - Land Registry Integration', () => {
    it('should display complete Land Registry information for a property', async () => {
      // Setup API mocks
      mockServiceInstance.getPropertyOwnership.mockResolvedValue(mockPropertyOwnership);
      mockServiceInstance.getPriceHistory.mockResolvedValue(mockPriceHistory);
      mockServiceInstance.getTransactionHistory.mockResolvedValue(mockTransactionHistory);

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      // Wait for Land Registry section to load
      await waitFor(() => {
        expect(screen.getByText('Land Registry Information')).toBeInTheDocument();
      });

      // Check Property Ownership section
      const ownershipSection = screen.getByTestId('property-ownership');
      expect(within(ownershipSection).getByText('Property Ownership')).toBeInTheDocument();
      expect(within(ownershipSection).getByText('John Smith')).toBeInTheDocument();
      expect(within(ownershipSection).getByText('Jane Smith')).toBeInTheDocument();
      expect(within(ownershipSection).getByText('Freehold')).toBeInTheDocument();
      expect(within(ownershipSection).getByText('ABC123456')).toBeInTheDocument();

      // Check Price History Chart section
      const priceHistorySection = screen.getByTestId('price-history-chart');
      expect(within(priceHistorySection).getByText('Price History')).toBeInTheDocument();
      expect(within(priceHistorySection).getByText('£450,000')).toBeInTheDocument();
      expect(within(priceHistorySection).getByText('£380,000')).toBeInTheDocument();

      // Verify API calls were made
      expect(mockServiceInstance.getPropertyOwnership).toHaveBeenCalledWith('12345678');
      expect(mockServiceInstance.getPriceHistory).toHaveBeenCalledWith('12345678');
    });

    it('should handle loading states correctly', async () => {
      // Setup delayed API responses
      mockServiceInstance.getPropertyOwnership.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPropertyOwnership), 1000))
      );
      mockServiceInstance.getPriceHistory.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPriceHistory), 1000))
      );

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      // Check loading states
      expect(screen.getByText('Loading Land Registry data...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Property Ownership')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Loading should be gone
      expect(screen.queryByText('Loading Land Registry data...')).not.toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Setup API error
      mockServiceInstance.getPropertyOwnership.mockRejectedValue(
        new Error('Land Registry API unavailable')
      );
      mockServiceInstance.getPriceHistory.mockRejectedValue(
        new Error('Land Registry API unavailable')
      );

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/Failed to load Land Registry data/)).toBeInTheDocument();
      });

      // Check retry button
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      // Test retry functionality
      mockServiceInstance.getPropertyOwnership.mockResolvedValue(mockPropertyOwnership);
      mockServiceInstance.getPriceHistory.mockResolvedValue(mockPriceHistory);

      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Property Ownership')).toBeInTheDocument();
      });
    });

    it('should display price history chart with interactive features', async () => {
      mockServiceInstance.getPriceHistory.mockResolvedValue(mockPriceHistory);

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
      });

      const chartContainer = screen.getByTestId('price-history-chart');
      
      // Check chart data points
      expect(within(chartContainer).getByText('£450,000')).toBeInTheDocument();
      expect(within(chartContainer).getByText('£380,000')).toBeInTheDocument();
      
      // Check date formatting
      expect(within(chartContainer).getByText('Jun 2023')).toBeInTheDocument();
      expect(within(chartContainer).getByText('Jan 2020')).toBeInTheDocument();

      // Test chart interactions (hover, tooltip)
      const chartElement = within(chartContainer).getByRole('img', { name: /price history chart/i });
      fireEvent.mouseOver(chartElement);
      
      await waitFor(() => {
        expect(screen.getByText(/Sale Date:/)).toBeInTheDocument();
      });
    });
  });

  describe('Admin Dashboard - Land Registry Monitoring', () => {
    it('should display Land Registry monitoring dashboard', async () => {
      // Setup API status mock
      mockServiceInstance.getApiStatus.mockResolvedValue({
        status: 'operational',
        lastSync: '2024-01-15T10:00:00Z',
        totalRecords: 150000,
        dailyRequests: 1250,
        errorRate: 0.02
      });

      mockServiceInstance.getUsageStats.mockResolvedValue({
        totalRequests: 50000,
        successfulRequests: 49000,
        failedRequests: 1000,
        averageResponseTime: 250,
        peakUsageHour: 14
      });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Navigate to Land Registry tab
      const landRegistryTab = screen.getByText('Land Registry');
      fireEvent.click(landRegistryTab);

      await waitFor(() => {
        expect(screen.getByText('Land Registry API Status')).toBeInTheDocument();
      });

      // Check API status cards
      expect(screen.getByText('Operational')).toBeInTheDocument();
      expect(screen.getByText('150,000')).toBeInTheDocument(); // Total records
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Daily requests
      expect(screen.getByText('0.02%')).toBeInTheDocument(); // Error rate

      // Check usage analytics
      expect(screen.getByText('Usage Analytics')).toBeInTheDocument();
      expect(screen.getByText('50,000')).toBeInTheDocument(); // Total requests
      expect(screen.getByText('250ms')).toBeInTheDocument(); // Average response time
    });

    it('should handle data synchronization from admin dashboard', async () => {
      mockServiceInstance.syncData.mockResolvedValue({
        success: true,
        recordsProcessed: 1500,
        recordsUpdated: 150,
        recordsAdded: 50,
        syncTime: '2024-01-15T11:00:00Z',
        duration: 45000
      });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Navigate to Land Registry tab
      const landRegistryTab = screen.getByText('Land Registry');
      fireEvent.click(landRegistryTab);

      await waitFor(() => {
        expect(screen.getByText('Data Management')).toBeInTheDocument();
      });

      // Find and click sync button
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      // Check loading state
      expect(screen.getByText('Syncing...')).toBeInTheDocument();

      // Wait for sync completion
      await waitFor(() => {
        expect(screen.getByText('Sync completed successfully')).toBeInTheDocument();
      });

      // Check sync results
      expect(screen.getByText('1,500 records processed')).toBeInTheDocument();
      expect(screen.getByText('150 records updated')).toBeInTheDocument();
      expect(screen.getByText('50 new records added')).toBeInTheDocument();

      // Verify API call
      expect(mockServiceInstance.syncData).toHaveBeenCalledWith({
        syncType: 'incremental',
        forceUpdate: false
      });
    });

    it('should display real-time monitoring data', async () => {
      // Setup real-time data mock
      const mockRealtimeData = {
        activeConnections: 25,
        requestsPerMinute: 45,
        responseTime: 180,
        errorCount: 2,
        lastError: '2024-01-15T10:55:00Z'
      };

      mockServiceInstance.getApiStatus.mockResolvedValue({
        status: 'operational',
        lastSync: '2024-01-15T10:00:00Z',
        totalRecords: 150000,
        dailyRequests: 1250,
        errorRate: 0.02,
        realtime: mockRealtimeData
      });

      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Navigate to Land Registry tab
      const landRegistryTab = screen.getByText('Land Registry');
      fireEvent.click(landRegistryTab);

      await waitFor(() => {
        expect(screen.getByText('Real-time Monitoring')).toBeInTheDocument();
      });

      // Check real-time metrics
      expect(screen.getByText('25')).toBeInTheDocument(); // Active connections
      expect(screen.getByText('45')).toBeInTheDocument(); // Requests per minute
      expect(screen.getByText('180ms')).toBeInTheDocument(); // Response time
      expect(screen.getByText('2')).toBeInTheDocument(); // Error count
    });
  });

  describe('User Workflow Integration', () => {
    it('should complete full property search to Land Registry data workflow', async () => {
      const user = userEvent.setup();
      
      // Setup search results mock
      mockServiceInstance.searchByPostcode.mockResolvedValue([
        {
          uprn: '12345678',
          address: {
            line1: '123 Test Street',
            line2: '',
            city: 'London',
            postcode: 'SW1A 1AA',
            county: 'Greater London'
          },
          priceHistory: mockPriceHistory,
          lastSalePrice: 450000,
          lastSaleDate: '2023-06-15'
        }
      ]);

      mockServiceInstance.getPropertyOwnership.mockResolvedValue(mockPropertyOwnership);
      mockServiceInstance.getPriceHistory.mockResolvedValue(mockPriceHistory);

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Land Registry Information')).toBeInTheDocument();
      });

      // Verify complete data display
      expect(screen.getByText('Property Ownership')).toBeInTheDocument();
      expect(screen.getByText('Price History')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('£450,000')).toBeInTheDocument();

      // Test interactive elements
      const ownershipCard = screen.getByTestId('property-ownership');
      await user.hover(ownershipCard);
      
      // Check for additional details on hover
      await waitFor(() => {
        expect(screen.getByText('Registration Date: 15 Jan 2020')).toBeInTheDocument();
      });
    });

    it('should handle postcode-based property search with Land Registry enrichment', async () => {
      const user = userEvent.setup();
      
      // Setup bulk search mock
      mockServiceInstance.bulkSearch.mockResolvedValue({
        results: [
          {
            uprn: '12345678',
            address: {
              line1: '123 Test Street',
              line2: '',
              city: 'London',
              postcode: 'SW1A 1AA',
              county: 'Greater London'
            },
            ownership: mockPropertyOwnership,
            priceHistory: mockPriceHistory,
            averagePrice: 415000,
            priceChange: 18.4
          }
        ],
        totalResults: 1,
        searchTime: 250
      });

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      // Find and use postcode search
      const searchInput = screen.getByPlaceholderText('Enter postcode');
      await user.type(searchInput, 'SW1A 1AA');
      
      const searchButton = screen.getByText('Search');
      await user.click(searchButton);

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });

      // Check enriched results
      expect(screen.getByText('123 Test Street')).toBeInTheDocument();
      expect(screen.getByText('Average Price: £415,000')).toBeInTheDocument();
      expect(screen.getByText('Price Change: +18.4%')).toBeInTheDocument();

      // Verify API call
      expect(mockServiceInstance.bulkSearch).toHaveBeenCalledWith({
        postcode: 'SW1A 1AA',
        includeOwnership: true,
        includePriceHistory: true
      });
    });
  });

  describe('Performance and Accessibility', () => {
    it('should meet accessibility standards', async () => {
      mockServiceInstance.getPropertyOwnership.mockResolvedValue(mockPropertyOwnership);
      mockServiceInstance.getPriceHistory.mockResolvedValue(mockPriceHistory);

      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Land Registry Information')).toBeInTheDocument();
      });

      // Check ARIA labels
      expect(screen.getByLabelText('Property ownership information')).toBeInTheDocument();
      expect(screen.getByLabelText('Price history chart')).toBeInTheDocument();

      // Check keyboard navigation
      const ownershipSection = screen.getByTestId('property-ownership');
      expect(ownershipSection).toHaveAttribute('tabIndex', '0');

      // Check semantic HTML
      expect(screen.getByRole('region', { name: 'Land Registry Information' })).toBeInTheDocument();
      expect(screen.getByRole('table', { name: 'Property ownership details' })).toBeInTheDocument();
    });

    it('should handle large datasets efficiently', async () => {
      // Create large price history dataset
      const largePriceHistory = Array.from({ length: 100 }, (_, index) => ({
        id: `ph_${index}`,
        uprn: '12345678',
        saleDate: `202${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
        price: 300000 + (index * 1000),
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
      }));

      mockServiceInstance.getPriceHistory.mockResolvedValue(largePriceHistory);
      mockServiceInstance.getPropertyOwnership.mockResolvedValue(mockPropertyOwnership);

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <PropertyDetail />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Price History')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      // Check that chart handles large dataset
      const chartContainer = screen.getByTestId('price-history-chart');
      expect(chartContainer).toBeInTheDocument();
      
      // Should show data aggregation for large datasets
      expect(screen.getByText(/Showing \d+ of \d+ transactions/)).toBeInTheDocument();
    });
  });
});