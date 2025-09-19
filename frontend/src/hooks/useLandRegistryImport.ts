import { useState, useEffect, useCallback } from 'react';
import { landRegistryService, CsvImportResponse, ImportStatus, ImportHistoryItem } from '../services/landRegistryService';
import { toast } from 'sonner';

export const useLandRegistryImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImport, setCurrentImport] = useState<ImportStatus | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    errors: string[];
  } | null>(null);

  // Load import history on mount
  useEffect(() => {
    loadImportHistory();
  }, []);

  // Poll for import status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentImport && ['pending', 'processing'].includes(currentImport.status)) {
      interval = setInterval(async () => {
        try {
          const status = await landRegistryService.getImportStatus(currentImport.importId);
          setCurrentImport(status);
          
          if (['completed', 'failed', 'cancelled'].includes(status.status)) {
            clearInterval(interval);
            loadImportHistory(); // Refresh history
            
            if (status.status === 'completed') {
              toast.success(`Import completed successfully! ${status.successfulRecords} records imported.`);
            } else if (status.status === 'failed') {
              toast.error('Import failed. Please check the error report.');
            }
          }
        } catch (error) {
          console.error('Error polling import status:', error);
          clearInterval(interval);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentImport]);

  const loadImportHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await landRegistryService.getImportHistory();
      setImportHistory(history);
    } catch (error) {
      console.error('Error loading import history:', error);
      toast.error('Failed to load import history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setValidationResults(null);
    
    // Basic client-side validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }
    
    // TODO: Add more sophisticated validation
    setValidationResults({
      isValid: true,
      totalRecords: 0, // Will be determined by backend
      validRecords: 0,
      invalidRecords: 0,
      errors: []
    });
  }, []);

  const startImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response: CsvImportResponse = await landRegistryService.importCsv(selectedFile);
      
      if (response.success) {
        toast.success('File uploaded successfully. Import started.');
        
        // Start polling for status
        const status = await landRegistryService.getImportStatus(response.importId);
        setCurrentImport(status);
        
        setValidationResults({
          isValid: true,
          totalRecords: response.totalRecords,
          validRecords: response.validRecords,
          invalidRecords: response.invalidRecords,
          errors: response.errors || []
        });
      } else {
        toast.error(response.message || 'Import failed');
      }
    } catch (error: any) {
      console.error('Error starting import:', error);
      toast.error(error.response?.data?.message || 'Failed to start import');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile]);

  const cancelImport = useCallback(async (importId: string) => {
    try {
      const response = await landRegistryService.cancelImport(importId);
      if (response.success) {
        toast.success('Import cancelled successfully');
        setCurrentImport(null);
        loadImportHistory();
      } else {
        toast.error(response.message || 'Failed to cancel import');
      }
    } catch (error: any) {
      console.error('Error cancelling import:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel import');
    }
  }, [loadImportHistory]);

  const downloadTemplate = useCallback(async () => {
    try {
      const blob = await landRegistryService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'land_registry_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  }, []);

  const downloadErrorReport = useCallback(async (importId: string) => {
    try {
      const blob = await landRegistryService.downloadErrorReport(importId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `import_errors_${importId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Error report downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading error report:', error);
      toast.error('Failed to download error report');
    }
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    currentImport,
    importHistory,
    isLoadingHistory,
    selectedFile,
    validationResults,
    
    // Actions
    handleFileSelect,
    startImport,
    cancelImport,
    downloadTemplate,
    downloadErrorReport,
    loadImportHistory
  };
};