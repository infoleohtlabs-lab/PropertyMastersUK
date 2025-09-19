import { apiService } from './api';
import { toast } from 'sonner';

// Import Job Types
export interface ImportJob {
  id: string;
  filename: string;
  filepath: string;
  fileSize: number;
  status: ImportJobStatus;
  uploadedBy: string;
  uploadedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: {
    originalName?: string;
    mimeType?: string;
    uploadTimestamp?: number;
    [key: string]: any;
  };
  validationResults?: any[];
  stats?: {
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    processedRows?: number;
    duplicates?: number;
    errors?: number;
  };
  processingErrors?: string[];
  errorMessage?: string;
  validationStartedAt?: string;
  validationCompletedAt?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ImportJobStatus = 
  | 'uploaded'
  | 'validating'
  | 'validated'
  | 'validation_failed'
  | 'processing'
  | 'completed'
  | 'processing_failed'
  | 'cancelled';

export interface ImportJobQuery {
  page?: number;
  limit?: number;
  status?: ImportJobStatus;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ImportJobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  totalRowsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface ValidationRule {
  id: string;
  field: string;
  ruleType: 'required' | 'format' | 'range' | 'custom';
  parameters: Record<string, any>;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformationType: 'direct' | 'format' | 'lookup' | 'calculate';
  transformationConfig: Record<string, any>;
  isRequired: boolean;
  defaultValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportConfiguration {
  id: string;
  name: string;
  description?: string;
  validationRules: ValidationRule[];
  dataMappings: DataMapping[];
  settings: {
    batchSize?: number;
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class AdminService {
  private readonly baseUrl = '/api/admin/land-registry-import';

  // Import Job Management
  async uploadCsvFile(file: File, configId?: string): Promise<ImportJob> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (configId) {
        formData.append('configId', configId);
      }

      const response = await apiService.post<ImportJob>(
        `${this.baseUrl}/land-registry-import/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('CSV file uploaded successfully');
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload CSV file';
      toast.error(errorMessage);
      throw error;
    }
  }

  async getImportJobs(query?: ImportJobQuery): Promise<{ jobs: ImportJob[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiService.get<{ jobs: ImportJob[]; total: number; page: number; limit: number }>(
        `${this.baseUrl}/land-registry-import/jobs`,
        { params: query }
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch import jobs');
      throw error;
    }
  }

  async getImportJob(jobId: string): Promise<ImportJob> {
    try {
      const response = await apiService.get<ImportJob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch import job details');
      throw error;
    }
  }

  async validateCsv(jobId: string): Promise<ImportJob> {
    try {
      const response = await apiService.post<ImportJob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/validate`
      );
      toast.success('CSV validation started');
      return response;
    } catch (error: any) {
      toast.error('Failed to start CSV validation');
      throw error;
    }
  }

  async processCsv(jobId: string): Promise<ImportJob> {
    try {
      const response = await apiService.post<ImportJob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/process`
      );
      toast.success('CSV processing started');
      return response;
    } catch (error: any) {
      toast.error('Failed to start CSV processing');
      throw error;
    }
  }

  async cancelImportJob(jobId: string): Promise<ImportJob> {
    try {
      const response = await apiService.post<ImportJob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/cancel`
      );
      toast.success('Import job cancelled');
      return response;
    } catch (error: any) {
      toast.error('Failed to cancel import job');
      throw error;
    }
  }

  async retryImportJob(jobId: string): Promise<ImportJob> {
    try {
      const response = await apiService.post<ImportJob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/retry`
      );
      toast.success('Import job retry started');
      return response;
    } catch (error: any) {
      toast.error('Failed to retry import job');
      throw error;
    }
  }

  async deleteImportJob(jobId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/land-registry-import/jobs/${jobId}`);
      toast.success('Import job deleted');
    } catch (error: any) {
      toast.error('Failed to delete import job');
      throw error;
    }
  }

  async getImportJobErrors(jobId: string): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/errors`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch import job errors');
      throw error;
    }
  }

  async getImportJobProgress(jobId: string): Promise<{ progress: number; status: ImportJobStatus; message?: string }> {
    try {
      const response = await apiService.get<{ progress: number; status: ImportJobStatus; message?: string }>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/progress`
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  // Statistics and Analytics
  async getImportStats(): Promise<ImportJobStats> {
    try {
      const response = await apiService.get<ImportJobStats>(
        `${this.baseUrl}/land-registry-import/stats`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch import statistics');
      throw error;
    }
  }

  // Template and Export
  async downloadTemplate(): Promise<{
    filename: string;
    headers: string[];
    sampleData: string[][];
    description: string;
    instructions: string[];
  }> {
    try {
      const response = await apiService.get(
        `${this.baseUrl}/template`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch template');
      throw error;
    }
  }

  async downloadCsvTemplate(): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(
        `${this.baseUrl}/template`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'land-registry-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
      return response;
    } catch (error: any) {
      toast.error('Failed to download template');
      throw error;
    }
  }

  async exportProcessedData(jobId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(
        `${this.baseUrl}/land-registry-import/jobs/${jobId}/export`,
        { 
          params: { format },
          responseType: 'blob' 
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed-data-${jobId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
      return response;
    } catch (error: any) {
      toast.error('Failed to export data');
      throw error;
    }
  }

  // Configuration Management
  async getValidationRules(): Promise<ValidationRule[]> {
    try {
      const response = await apiService.get<ValidationRule[]>(
        `${this.baseUrl}/land-registry-import/validation-rules`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch validation rules');
      throw error;
    }
  }

  async createValidationRule(rule: Omit<ValidationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ValidationRule> {
    try {
      const response = await apiService.post<ValidationRule>(
        `${this.baseUrl}/land-registry-import/validation-rules`,
        rule
      );
      toast.success('Validation rule created');
      return response;
    } catch (error: any) {
      toast.error('Failed to create validation rule');
      throw error;
    }
  }

  async updateValidationRule(ruleId: string, rule: Partial<ValidationRule>): Promise<ValidationRule> {
    try {
      const response = await apiService.put<ValidationRule>(
        `${this.baseUrl}/land-registry-import/validation-rules/${ruleId}`,
        rule
      );
      toast.success('Validation rule updated');
      return response;
    } catch (error: any) {
      toast.error('Failed to update validation rule');
      throw error;
    }
  }

  async deleteValidationRule(ruleId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/land-registry-import/validation-rules/${ruleId}`);
      toast.success('Validation rule deleted');
    } catch (error: any) {
      toast.error('Failed to delete validation rule');
      throw error;
    }
  }

  // Data Mapping Management
  async getDataMappings(): Promise<DataMapping[]> {
    try {
      const response = await apiService.get<DataMapping[]>(
        `${this.baseUrl}/land-registry-import/data-mappings`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch data mappings');
      throw error;
    }
  }

  async createDataMapping(mapping: Omit<DataMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataMapping> {
    try {
      const response = await apiService.post<DataMapping>(
        `${this.baseUrl}/land-registry-import/data-mappings`,
        mapping
      );
      toast.success('Data mapping created');
      return response;
    } catch (error: any) {
      toast.error('Failed to create data mapping');
      throw error;
    }
  }

  async updateDataMapping(mappingId: string, mapping: Partial<DataMapping>): Promise<DataMapping> {
    try {
      const response = await apiService.put<DataMapping>(
        `${this.baseUrl}/land-registry-import/data-mappings/${mappingId}`,
        mapping
      );
      toast.success('Data mapping updated');
      return response;
    } catch (error: any) {
      toast.error('Failed to update data mapping');
      throw error;
    }
  }

  async deleteDataMapping(mappingId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/land-registry-import/data-mappings/${mappingId}`);
      toast.success('Data mapping deleted');
    } catch (error: any) {
      toast.error('Failed to delete data mapping');
      throw error;
    }
  }

  // Import Configuration Management
  async getImportConfigurations(): Promise<ImportConfiguration[]> {
    try {
      const response = await apiService.get<ImportConfiguration[]>(
        `${this.baseUrl}/land-registry-import/configurations`
      );
      return response;
    } catch (error: any) {
      toast.error('Failed to fetch import configurations');
      throw error;
    }
  }

  async createImportConfiguration(config: Omit<ImportConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImportConfiguration> {
    try {
      const response = await apiService.post<ImportConfiguration>(
        `${this.baseUrl}/land-registry-import/configurations`,
        config
      );
      toast.success('Import configuration created');
      return response;
    } catch (error: any) {
      toast.error('Failed to create import configuration');
      throw error;
    }
  }

  async updateImportConfiguration(configId: string, config: Partial<ImportConfiguration>): Promise<ImportConfiguration> {
    try {
      const response = await apiService.put<ImportConfiguration>(
        `${this.baseUrl}/land-registry-import/configurations/${configId}`,
        config
      );
      toast.success('Import configuration updated');
      return response;
    } catch (error: any) {
      toast.error('Failed to update import configuration');
      throw error;
    }
  }

  async deleteImportConfiguration(configId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/land-registry-import/configurations/${configId}`);
      toast.success('Import configuration deleted');
    } catch (error: any) {
      toast.error('Failed to delete import configuration');
      throw error;
    }
  }

  // Bulk Operations
  async bulkDeleteImportJobs(jobIds: string[]): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/land-registry-import/jobs/bulk-delete`, { jobIds });
      toast.success(`${jobIds.length} import jobs deleted`);
    } catch (error: any) {
      toast.error('Failed to delete import jobs');
      throw error;
    }
  }

  async cleanupOldJobs(olderThanDays: number): Promise<{ deletedCount: number }> {
    try {
      const response = await apiService.post<{ deletedCount: number }>(
        `${this.baseUrl}/land-registry-import/cleanup`,
        { olderThanDays }
      );
      toast.success(`${response.deletedCount} old import jobs cleaned up`);
      return response;
    } catch (error: any) {
      toast.error('Failed to cleanup old jobs');
      throw error;
    }
  }
}

// Create singleton instance
export const adminService = new AdminService();
export default adminService;