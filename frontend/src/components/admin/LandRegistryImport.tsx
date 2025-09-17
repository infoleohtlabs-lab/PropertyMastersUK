import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Clock,
  Database,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface ImportJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  errorRecords: number;
  startTime?: string;
  endTime?: string;
  errors: ImportError[];
  warnings: ImportWarning[];
}

interface ImportError {
  row: number;
  column: string;
  message: string;
  value: string;
}

interface ImportWarning {
  row: number;
  column: string;
  message: string;
  value: string;
}

interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  preview: any[];
}

const LandRegistryImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([
    {
      id: '1',
      fileName: 'land_registry_data_2024_01.csv',
      fileSize: 2048576,
      status: 'completed',
      progress: 100,
      totalRecords: 1500,
      processedRecords: 1500,
      validRecords: 1485,
      errorRecords: 15,
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:15:00',
      errors: [
        { row: 45, column: 'price', message: 'Invalid price format', value: '£invalid' },
        { row: 123, column: 'postcode', message: 'Invalid postcode format', value: 'INVALID' }
      ],
      warnings: [
        { row: 67, column: 'property_type', message: 'Unusual property type', value: 'CASTLE' }
      ]
    },
    {
      id: '2',
      fileName: 'land_registry_data_2024_02.csv',
      fileSize: 1536000,
      status: 'processing',
      progress: 65,
      totalRecords: 1200,
      processedRecords: 780,
      validRecords: 775,
      errorRecords: 5,
      startTime: '2024-01-15 10:30:00',
      errors: [],
      warnings: []
    }
  ]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [importSettings, setImportSettings] = useState({
    skipDuplicates: true,
    validatePostcodes: true,
    validatePrices: true,
    batchSize: 100,
    autoRetry: true
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    setSelectedFile(file);
    setValidationResult(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    
    // Simulate file validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation result
    const mockResult: ValidationResult = {
      isValid: true,
      totalRows: 1000,
      validRows: 985,
      errors: [
        { row: 45, column: 'price', message: 'Invalid price format', value: '£invalid' },
        { row: 123, column: 'postcode', message: 'Invalid postcode format', value: 'INVALID' },
        { row: 234, column: 'date', message: 'Invalid date format', value: '32/13/2024' }
      ],
      warnings: [
        { row: 67, column: 'property_type', message: 'Unusual property type', value: 'CASTLE' },
        { row: 89, column: 'price', message: 'Price seems unusually high', value: '50000000' }
      ],
      preview: [
        { row: 1, date: '2024-01-15', postcode: 'SW1A 1AA', property_type: 'FLAT', price: '450000', address: '123 Example Street' },
        { row: 2, date: '2024-01-15', postcode: 'W1K 1AA', property_type: 'HOUSE', price: '750000', address: '456 Sample Road' },
        { row: 3, date: '2024-01-15', postcode: 'EC1A 1BB', property_type: 'FLAT', price: '320000', address: '789 Test Avenue' }
      ]
    };
    
    setValidationResult(mockResult);
    setIsValidating(false);
  };

  const startImport = async () => {
    if (!selectedFile || !validationResult) return;

    const newJob: ImportJob = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      status: 'pending',
      progress: 0,
      totalRecords: validationResult.totalRows,
      processedRecords: 0,
      validRecords: 0,
      errorRecords: 0,
      startTime: new Date().toISOString(),
      errors: [],
      warnings: []
    };

    setImportJobs(prev => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    
    // Simulate import process
    simulateImportProgress(newJob.id);
    
    // Reset form
    setSelectedFile(null);
    setValidationResult(null);
  };

  const simulateImportProgress = async (jobId: string) => {
    const updateJob = (updates: Partial<ImportJob>) => {
      setImportJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ));
    };

    // Validation phase
    updateJob({ status: 'validating' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Processing phase
    updateJob({ status: 'processing' });
    
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const processedRecords = Math.floor((progress / 100) * 1000);
      updateJob({ 
        progress, 
        processedRecords,
        validRecords: Math.floor(processedRecords * 0.98),
        errorRecords: Math.floor(processedRecords * 0.02)
      });
    }

    // Completion
    updateJob({ 
      status: 'completed', 
      endTime: new Date().toISOString(),
      progress: 100
    });
  };

  const pauseJob = (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'paused' as const } : job
    ));
  };

  const resumeJob = (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'processing' as const } : job
    ));
  };

  const retryJob = (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { 
        ...job, 
        status: 'pending' as const, 
        progress: 0, 
        processedRecords: 0,
        startTime: new Date().toISOString(),
        endTime: undefined
      } : job
    ));
    simulateImportProgress(jobId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
      case 'validating':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'paused':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'validating':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return '-';
    if (!end) return 'In progress';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const selectedJob = importJobs.find(job => job.id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Land Registry Import</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Import Guide
          </Button>
        </div>
      </div>

      {/* Import Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Imports</p>
                <p className="text-2xl font-bold text-blue-600">{importJobs.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {importJobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {importJobs.filter(job => ['processing', 'validating'].includes(job.status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-purple-600">
                  {importJobs.reduce((sum, job) => sum + job.totalRecords, 0).toLocaleString()}
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-gray-500">or</p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="max-w-xs mx-auto"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Supported format: CSV files up to 50MB
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={validateFile} 
                    disabled={isValidating}
                    variant="outline"
                  >
                    {isValidating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Validate
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setSelectedFile(null)}
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Validation Results</h3>
                <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                  {validationResult.isValid ? 'Valid' : 'Has Issues'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Total Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {validationResult.totalRows.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Valid Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {validationResult.validRows.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {validationResult.errors.length}
                  </p>
                </div>
              </div>

              {/* Errors and Warnings */}
              {validationResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors ({validationResult.errors.length})</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {validationResult.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">
                          Row {error.row}, Column '{error.column}': {error.message} (Value: '{error.value}')
                        </div>
                      ))}
                      {validationResult.errors.length > 5 && (
                        <div className="text-sm text-gray-500 mt-1">
                          ... and {validationResult.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warnings ({validationResult.warnings.length})</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {validationResult.warnings.slice(0, 3).map((warning, index) => (
                        <div key={index} className="text-sm">
                          Row {warning.row}, Column '{warning.column}': {warning.message} (Value: '{warning.value}')
                        </div>
                      ))}
                      {validationResult.warnings.length > 3 && (
                        <div className="text-sm text-gray-500 mt-1">
                          ... and {validationResult.warnings.length - 3} more warnings
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview */}
              <div>
                <h4 className="font-medium mb-2">Data Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Postcode</TableHead>
                        <TableHead>Property Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.preview.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.row}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.postcode}</TableCell>
                          <TableCell>{row.property_type}</TableCell>
                          <TableCell>£{parseInt(row.price).toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{row.address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Import Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Import Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Select 
                      value={importSettings.batchSize.toString()} 
                      onValueChange={(value) => setImportSettings(prev => ({ ...prev, batchSize: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 records</SelectItem>
                        <SelectItem value="100">100 records</SelectItem>
                        <SelectItem value="200">200 records</SelectItem>
                        <SelectItem value="500">500 records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={importSettings.skipDuplicates}
                          onChange={(e) => setImportSettings(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                        />
                        <span className="text-sm">Skip duplicates</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={importSettings.autoRetry}
                          onChange={(e) => setImportSettings(prev => ({ ...prev, autoRetry: e.target.checked }))}
                        />
                        <span className="text-sm">Auto retry on errors</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Import Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={startImport}
                  disabled={!validationResult.isValid}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Import
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.fileName}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(job.fileSize)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={job.progress} className="w-20" />
                      <span className="text-sm text-gray-500">{job.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{job.processedRecords.toLocaleString()} / {job.totalRecords.toLocaleString()}</div>
                      <div className="text-gray-500">
                        {job.validRecords.toLocaleString()} valid, {job.errorRecords.toLocaleString()} errors
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDuration(job.startTime, job.endTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJobId(job.id)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {job.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => pauseJob(job.id)}
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resumeJob(job.id)}
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryJob(job.id)}
                          title="Retry"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Details */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Import Details: {selectedJob.fileName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Records:</span>
                    <span>{selectedJob.totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processed:</span>
                    <span>{selectedJob.processedRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid:</span>
                    <span className="text-green-600">{selectedJob.validRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span className="text-red-600">{selectedJob.errorRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formatDuration(selectedJob.startTime, selectedJob.endTime)}</span>
                  </div>
                </div>
              </div>
              
              {selectedJob.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Errors ({selectedJob.errors.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedJob.errors.map((error, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded">
                        <strong>Row {error.row}:</strong> {error.message}
                        <br />
                        <span className="text-gray-600">Column: {error.column}, Value: '{error.value}'</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LandRegistryImport;