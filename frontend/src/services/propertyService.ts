import { apiService } from './api';
import {
  Property,
  PropertySearchFilters,
  SearchResult,
  MarketAnalysis,
  PropertyFormData,
  ApiResponse,
  PaginatedResponse
} from '../types';

class PropertyService {
  async searchProperties(
    filters: PropertySearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult<Property>> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await apiService.get<PaginatedResponse<Property>>(
        `/properties/search?${params.toString()}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to search properties');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to search properties');
    }
  }

  async getProperty(id: string): Promise<Property> {
    try {
      const response = await apiService.get<ApiResponse<Property>>(`/properties/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Property not found');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get property');
    }
  }

  async createProperty(data: PropertyFormData): Promise<Property> {
    try {
      const response = await apiService.post<ApiResponse<Property>>('/properties', data);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create property');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error('Failed to create property');
    }
  }

  async updateProperty(id: string, data: Partial<PropertyFormData>): Promise<Property> {
    try {
      const response = await apiService.patch<ApiResponse<Property>>(`/properties/${id}`, data);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update property');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error('Failed to update property');
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const response = await apiService.delete<ApiResponse>(`/properties/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete property');
      }
    } catch (error: any) {
      throw new Error('Failed to delete property');
    }
  }

  async getAgentProperties(agentId: string, page: number = 1, limit: number = 20): Promise<SearchResult<Property>> {
    try {
      const response = await apiService.get<PaginatedResponse<Property>>(
        `/properties/agent/${agentId}?page=${page}&limit=${limit}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get agent properties');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get agent properties');
    }
  }

  async getMarketAnalysis(location: string, propertyType: string): Promise<MarketAnalysis> {
    try {
      const response = await apiService.get<ApiResponse<MarketAnalysis>>(
        `/properties/market-analysis?location=${encodeURIComponent(location)}&type=${propertyType}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get market analysis');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get market analysis');
    }
  }

  async uploadPropertyImages(propertyId: string, files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        apiService.uploadFile<ApiResponse<{ url: string }>>(
          `/properties/${propertyId}/images`,
          file
        )
      );
      
      const responses = await Promise.all(uploadPromises);
      
      return responses.map(response => {
        if (!response.success || !response.data) {
          throw new Error('Failed to upload image');
        }
        return response.data.url;
      });
    } catch (error: any) {
      throw new Error('Failed to upload property images');
    }
  }

  async deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
    try {
      const response = await apiService.delete<ApiResponse>(
        `/properties/${propertyId}/images/${imageId}`
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete image');
      }
    } catch (error: any) {
      throw new Error('Failed to delete property image');
    }
  }

  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    try {
      const response = await apiService.get<ApiResponse<Property[]>>(
        `/properties/featured?limit=${limit}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get featured properties');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get featured properties');
    }
  }

  async getRecentProperties(limit: number = 10): Promise<Property[]> {
    try {
      const response = await apiService.get<ApiResponse<Property[]>>(
        `/properties/recent?limit=${limit}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get recent properties');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get recent properties');
    }
  }

  async getSimilarProperties(propertyId: string, limit: number = 4): Promise<Property[]> {
    try {
      const response = await apiService.get<ApiResponse<Property[]>>(
        `/properties/${propertyId}/similar?limit=${limit}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get similar properties');
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to get similar properties');
    }
  }
}

export const propertyService = new PropertyService();
export default propertyService;