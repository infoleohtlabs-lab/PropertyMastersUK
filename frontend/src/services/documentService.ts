import { apiService } from './api';
import { toast } from 'sonner';

export interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: DocumentCategory;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  isActive: boolean;
  accessLevel: AccessLevel;
  tags: string[];
  description?: string;
  expiryDate?: string;
  checksum: string;
  propertyId?: string;
  tenancyId?: string;
  userId?: string;
}

export enum DocumentCategory {
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  IDENTITY = 'identity',
  FINANCIAL = 'financial',
  PROPERTY_DOCUMENT = 'property_document',
  TENANCY_AGREEMENT = 'tenancy_agreement',
  INVENTORY = 'inventory',
  INSPECTION_REPORT = 'inspection_report',
  MAINTENANCE_RECORD = 'maintenance_record',
  LEGAL_DOCUMENT = 'legal_document',
  INSURANCE = 'insurance',
  COMPLIANCE = 'compliance',
  OTHER = 'other'
}

export enum AccessLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential'
}

export interface DocumentUploadOptions {
  category: DocumentCategory;
  description?: string;
  tags?: string[];
  accessLevel?: AccessLevel;
  expiryDate?: string;
  propertyId?: string;
  tenancyId?: string;
  replaceExisting?: boolean;
}

export interface DocumentSearchFilters {
  category?: DocumentCategory;
  accessLevel?: AccessLevel;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  propertyId?: string;
  tenancyId?: string;
  isActive?: boolean;
}

export interface DocumentVersion {
  version: number;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  checksum: string;
  changeNote?: string;
}

export interface BulkUploadResult {
  successful: DocumentMetadata[];
  failed: { filename: string; error: string }[];
  totalProcessed: number;
}

class DocumentService {
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!this.allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type '${file.type}' is not allowed`
      };
    }

    // Check filename for security
    const filename = file.name;
    const dangerousPatterns = [/\.\./, /[<>:"|?*]/, /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i];
    
    if (dangerousPatterns.some(pattern => pattern.test(filename))) {
      return {
        isValid: false,
        error: 'Filename contains invalid characters or reserved names'
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Upload a single document
   */
  async uploadDocument(
    file: File,
    options: DocumentUploadOptions
  ): Promise<DocumentMetadata> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(file);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', options.category);
      formData.append('accessLevel', options.accessLevel || AccessLevel.PRIVATE);
      formData.append('checksum', checksum);
      
      if (options.description) formData.append('description', options.description);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
      if (options.expiryDate) formData.append('expiryDate', options.expiryDate);
      if (options.propertyId) formData.append('propertyId', options.propertyId);
      if (options.tenancyId) formData.append('tenancyId', options.tenancyId);
      if (options.replaceExisting) formData.append('replaceExisting', 'true');

      const response = await apiService.uploadFile('/documents/upload', formData);
      
      toast.success('Document uploaded successfully');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload multiple documents
   */
  async bulkUploadDocuments(
    files: File[],
    options: DocumentUploadOptions
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      successful: [],
      failed: [],
      totalProcessed: files.length
    };

    for (const file of files) {
      try {
        const document = await this.uploadDocument(file, options);
        result.successful.push(document);
      } catch (error: any) {
        result.failed.push({
          filename: file.name,
          error: error.message
        });
      }
    }

    const successCount = result.successful.length;
    const failCount = result.failed.length;
    
    if (successCount > 0 && failCount === 0) {
      toast.success(`All ${successCount} documents uploaded successfully`);
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`${successCount} documents uploaded, ${failCount} failed`);
    } else {
      toast.error(`All ${failCount} documents failed to upload`);
    }

    return result;
  }

  /**
   * Get documents with filtering and pagination
   */
  async getDocuments(
    filters?: DocumentSearchFilters,
    page = 1,
    limit = 20
  ): Promise<{ documents: DocumentMetadata[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiService.get(`/documents?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<DocumentMetadata> {
    try {
      const response = await apiService.get(`/documents/${documentId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Download document
   */
  async downloadDocument(documentId: string, version?: number): Promise<Blob> {
    try {
      const url = version 
        ? `/documents/${documentId}/download?version=${version}`
        : `/documents/${documentId}/download`;
      
      const response = await apiService.get(url, { responseType: 'blob' });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to download document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const response = await apiService.get(`/documents/${documentId}/versions`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch document versions';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<Pick<DocumentMetadata, 'description' | 'tags' | 'accessLevel' | 'expiryDate'>>
  ): Promise<DocumentMetadata> {
    try {
      const response = await apiService.patch(`/documents/${documentId}`, updates);
      toast.success('Document updated successfully');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete document (GDPR compliant)
   */
  async deleteDocument(documentId: string, reason?: string): Promise<void> {
    try {
      await apiService.delete(`/documents/${documentId}`, {
        data: { reason }
      });
      toast.success('Document deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get document preview URL
   */
  getPreviewUrl(documentId: string): string {
    return `/api/documents/${documentId}/preview`;
  }

  /**
   * Check if document can be previewed
   */
  canPreview(mimeType: string): boolean {
    const previewableMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    return previewableMimeTypes.includes(mimeType);
  }

  /**
   * Get document access permissions for current user
   */
  async getDocumentPermissions(documentId: string): Promise<{
    canView: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  }> {
    try {
      const response = await apiService.get(`/documents/${documentId}/permissions`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch permissions';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Share document with users
   */
  async shareDocument(
    documentId: string,
    userIds: string[],
    accessLevel: AccessLevel,
    expiryDate?: string
  ): Promise<void> {
    try {
      await apiService.post(`/documents/${documentId}/share`, {
        userIds,
        accessLevel,
        expiryDate
      });
      toast.success('Document shared successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to share document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get audit trail for document
   */
  async getDocumentAuditTrail(documentId: string): Promise<Array<{
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
    details?: any;
  }>> {
    try {
      const response = await apiService.get(`/documents/${documentId}/audit`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch audit trail';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const documentService = new DocumentService();
export default documentService;