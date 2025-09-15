import { create } from 'zustand';
import { Property, PropertyType, SearchFilters } from '../types';
import { propertyService } from '../services/propertyService';

interface SearchState {
  query: string;
  location: string;
  propertyType: PropertyType | '';
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
  results: Property[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
  recentSearches: string[];
  savedSearches: SearchFilters[];
  
  // Actions
  setQuery: (query: string) => void;
  setLocation: (location: string) => void;
  setPropertyType: (type: PropertyType | '') => void;
  setPriceRange: (min: number, max: number) => void;
  setBedrooms: (bedrooms: number) => void;
  setBathrooms: (bathrooms: number) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  search: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  loadMore: () => Promise<void>;
  saveSearch: (name: string) => void;
  removeSearch: (id: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: '',
  location: '',
  propertyType: '',
  minPrice: 0,
  maxPrice: 1000000,
  bedrooms: 0,
  bathrooms: 0,
  results: [],
  isLoading: false,
  error: null,
  totalResults: 0,
  currentPage: 1,
  totalPages: 0,
  filters: {
    propertyType: '',
    minPrice: 0,
    maxPrice: 1000000,
    bedrooms: 0,
    bathrooms: 0,
    location: '',
    radius: 5,
    sortBy: 'relevance',
    sortOrder: 'desc'
  },
  recentSearches: [],
  savedSearches: [],

  setQuery: (query: string) => {
    set({ query });
  },

  setLocation: (location: string) => {
    set({ location });
  },

  setPropertyType: (propertyType: PropertyType | '') => {
    set({ propertyType });
  },

  setPriceRange: (minPrice: number, maxPrice: number) => {
    set({ minPrice, maxPrice });
  },

  setBedrooms: (bedrooms: number) => {
    set({ bedrooms });
  },

  setBathrooms: (bathrooms: number) => {
    set({ bathrooms });
  },

  setFilters: (newFilters: Partial<SearchFilters>) => {
    const { filters } = get();
    set({ 
      filters: { ...filters, ...newFilters },
      ...newFilters
    });
  },

  search: async () => {
    const { query, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const searchParams = {
        query,
        location,
        propertyType: propertyType || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
        bedrooms: bedrooms > 0 ? bedrooms : undefined,
        bathrooms: bathrooms > 0 ? bathrooms : undefined,
        page: 1,
        limit: 20
      };
      
      const response = await propertyService.searchProperties(searchParams);
      
      set({
        results: response.properties,
        totalResults: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        isLoading: false
      });
      
      // Add to recent searches if query is not empty
      if (query.trim()) {
        get().addRecentSearch(query.trim());
      }
    } catch (error: any) {
      set({
        error: error.message || 'Search failed',
        isLoading: false,
        results: []
      });
    }
  },

  clearResults: () => {
    set({
      results: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 0,
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  },

  loadMore: async () => {
    const { currentPage, totalPages, isLoading, query, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, results } = get();
    
    if (isLoading || currentPage >= totalPages) return;
    
    set({ isLoading: true });
    
    try {
      const searchParams = {
        query,
        location,
        propertyType: propertyType || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 1000000 ? maxPrice : undefined,
        bedrooms: bedrooms > 0 ? bedrooms : undefined,
        bathrooms: bathrooms > 0 ? bathrooms : undefined,
        page: currentPage + 1,
        limit: 20
      };
      
      const response = await propertyService.searchProperties(searchParams);
      
      set({
        results: [...results, ...response.properties],
        currentPage: response.page,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load more results',
        isLoading: false
      });
    }
  },

  saveSearch: (name: string) => {
    const { filters, savedSearches } = get();
    const newSearch = {
      id: Date.now().toString(),
      name,
      ...filters,
      createdAt: new Date().toISOString()
    };
    
    set({
      savedSearches: [...savedSearches, newSearch]
    });
  },

  removeSearch: (id: string) => {
    const { savedSearches } = get();
    set({
      savedSearches: savedSearches.filter(search => search.id !== id)
    });
  },

  addRecentSearch: (query: string) => {
    const { recentSearches } = get();
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    set({ recentSearches: updatedSearches });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  }
}));