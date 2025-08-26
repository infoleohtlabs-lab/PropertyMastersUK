import { create } from 'zustand';
import { Property, PropertySearchFilters, SearchResult, MarketAnalysis, PropertyFormData } from '../types';
import { propertyService } from '../services/propertyService';

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  searchFilters: PropertySearchFilters;
  searchResults: SearchResult<Property> | null;
  marketAnalysis: MarketAnalysis | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProperties: (properties: Property[]) => void;
  setSelectedProperty: (property: Property | null) => void;
  setSearchFilters: (filters: PropertySearchFilters) => void;
  searchProperties: (filters?: PropertySearchFilters) => Promise<void>;
  getProperty: (id: string) => Promise<void>;
  createProperty: (data: PropertyFormData) => Promise<Property>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;
  getMarketAnalysis: (location: string, propertyType: string) => Promise<void>;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  selectedProperty: null,
  searchFilters: {},
  searchResults: null,
  marketAnalysis: null,
  isLoading: false,
  error: null,

  setProperties: (properties: Property[]) => {
    set({ properties });
  },

  setSelectedProperty: (property: Property | null) => {
    set({ selectedProperty: property });
  },

  setSearchFilters: (filters: PropertySearchFilters) => {
    set({ searchFilters: { ...get().searchFilters, ...filters } });
  },

  searchProperties: async (filters?: PropertySearchFilters) => {
    set({ isLoading: true, error: null });
    try {
      const searchFilters = filters || get().searchFilters;
      const results = await propertyService.searchProperties(searchFilters);
      set({
        searchResults: results,
        properties: results.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search properties',
        isLoading: false
      });
    }
  },

  getProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const property = await propertyService.getProperty(id);
      set({
        selectedProperty: property,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get property',
        isLoading: false
      });
    }
  },

  createProperty: async (data: PropertyFormData) => {
    set({ isLoading: true, error: null });
    try {
      const property = await propertyService.createProperty(data);
      set((state) => ({
        properties: [...state.properties, property],
        isLoading: false
      }));
      return property;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create property',
        isLoading: false
      });
      throw error;
    }
  },

  updateProperty: async (id: string, data: Partial<PropertyFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const property = await propertyService.updateProperty(id, data);
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? property : p),
        selectedProperty: state.selectedProperty?.id === id ? property : state.selectedProperty,
        isLoading: false
      }));
      return property;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update property',
        isLoading: false
      });
      throw error;
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await propertyService.deleteProperty(id);
      set((state) => ({
        properties: state.properties.filter(p => p.id !== id),
        selectedProperty: state.selectedProperty?.id === id ? null : state.selectedProperty,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete property',
        isLoading: false
      });
    }
  },

  getMarketAnalysis: async (location: string, propertyType: string) => {
    set({ isLoading: true, error: null });
    try {
      const analysis = await propertyService.getMarketAnalysis(location, propertyType);
      set({
        marketAnalysis: analysis,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get market analysis',
        isLoading: false
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));