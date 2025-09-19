import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminService, ImportJob, ImportJobStatus } from '../../services/adminService';

interface CsvUploadComponentProps {
  onUploadSuccess?: (job: ImportJob) => void;
  onUploadError?: (error: any) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface UploadProgress {
  jobId: string;
  progress: number;
  status: ImportJobStatus;
  message?: string;
}

const CsvUploadComponent: React.FC<CsvUploadComponentProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = ['.csv'],
  maxFileSize = 50, // 50MB default
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File validation
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      errors.push(`File type ${fileExtension} is not supported. Accepted types: ${acceptedFileTypes.join(', ')}`);
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${maxFileSize}MB`);
    }
    
    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty');
    }
    
    return errors;
  }, [acceptedFileTypes, maxFileSize]);

  // Progress tracking
  const startProgressTracking = useCallback((jobId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(async () => {
      try {
        const progress = await adminService.getImportJobProgress(jobId);
        setUploadProgress({
          jobId,
          progress: progress.progress,
          status: progress.status,
          message: progress.message
        });

        // Stop tracking if job is completed or failed
        if (['completed', 'processing_failed', 'validation_failed', 'cancelled'].includes(progress.status)) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setIsUploading(false);
        }
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }, 2000); // Check every 2 seconds
  }, []);

  // Stop progress tracking
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, [validateFile]);

  // Handle file upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      const job = await adminService.uploadCsvFile(selectedFile);
      
      setUploadProgress({
        jobId: job.id,
        progress: 0,
        status: job.status,
        message: 'Upload completed, starting validation...'
      });

      // Start progress tracking
      startProgressTracking(job.id);
      
      // Trigger validation
      await adminService.validateCsv(job.id);
      
      onUploadSuccess?.(job);
      
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(null);
      onUploadError?.(error);
      
      const errorMessage = error.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
    }
  }, [selectedFile, onUploadSuccess, onUploadError, startProgressTracking]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setValidationErrors([]);
    setUploadProgress(null);
    stopProgressTracking();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopProgressTracking]);

  // Download template
  const handleDownloadTemplate = useCallback(async () => {
    try {
      setIsDownloading(true);
      const template = await adminService.downloadTemplate();
      
      // Create CSV content with proper formatting
      const csvRows = [template.headers.join(',')];
      template.sampleData.forEach(row => {
        csvRows.push(row.join(','));
      });
      
      // Add instructions as comments at the top
      const csvContent = [
        '# Land Registry CSV Import Template',
        '# Instructions:',
        ...template.instructions.map(instruction => `# ${instruction}`),
        '',
        ...csvRows
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error('Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Cancel upload
  const handleCancelUpload = useCallback(async () => {
    if (uploadProgress?.jobId) {
      try {
        await adminService.cancelImportJob(uploadProgress.jobId);
        stopProgressTracking();
        setIsUploading(false);
        setUploadProgress(null);
        toast.success('Upload cancelled');
      } catch (error) {
        toast.error('Failed to cancel upload');
      }
    }
  }, [uploadProgress?.jobId, stopProgressTracking]);

  // Get status color
  const getStatusColor = (status: ImportJobStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing_failed':
      case 'validation_failed':
        return 'text-red-600';
      case 'processing':
      case 'validating':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: ImportJobStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing_failed':
      case 'validation_failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'processing':
      case 'validating':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">CSV File Upload</h3>
        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Downloading...' : 'Download Template'}
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="text-center">
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="w-12 h-12 mx-auto text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: {acceptedFileTypes.join(', ')} (max {maxFileSize}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(uploadProgress.status)}`}>
                  {getStatusIcon(uploadProgress.status)}
                  {uploadProgress.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {isUploading && (
                <button
                  onClick={handleCancelUpload}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {uploadProgress.progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {uploadProgress.message && (
              <p className="text-xs text-gray-600">{uploadProgress.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || validationErrors.length > 0 || isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload CSV
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CsvUploadComponent;