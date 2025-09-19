import { apiService } from './api';

export interface CsvImportResponse {
  success: boolean;
  message: string;
  importId: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors?: string[];
}

export interface ImportStatus {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
  startedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
}

export interface ImportHistoryItem {
  importId: string;
  fileName: string;
  status: 'completed' | 'failed' | 'cancelled';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  createdAt: string;
  completedAt?: string;
}

class LandRegistryService {
  async importCsv(file: File): Promise<CsvImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post('/land-registry/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getImportStatus(importId: string): Promise<ImportStatus> {
    return await apiService.get(`/land-registry/import-status/${importId}`);
  }

  async getImportHistory(): Promise<ImportHistoryItem[]> {
    return await apiService.get('/land-registry/import-history');
  }

  async cancelImport(importId: string): Promise<{ success: boolean; message: string }> {
    return await apiService.post(`/land-registry/cancel-import/${importId}`);
  }

  async downloadTemplate(): Promise<Blob> {
    return await apiService.get('/land-registry/csv-template', {
      responseType: 'blob',
    });
  }

  async downloadErrorReport(importId: string): Promise<Blob> {
    return await apiService.get(`/land-registry/error-report/${importId}`, {
      responseType: 'blob',
    });
  }
}

export const landRegistryService = new LandRegistryService();