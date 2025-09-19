import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import Progress from '../ui/progress';
import { Badge } from '../ui/Badge';
import { useLandRegistryImport } from '../../hooks/useLandRegistryImport';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  XCircle,
  Settings,
  RefreshCw,
  Mail,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LandRegistryImport: React.FC = () => {
  const {
    isUploading,
    currentImport,
    importHistory,
    isLoadingHistory,
    selectedFile,
    validationResults,
    handleFileSelect,
    startImport,
    cancelImport,
    downloadTemplate,
    downloadErrorReport,
    loadImportHistory
  } = useLandRegistryImport();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const calculateProgress = () => {
    if (!currentImport) return 0;
    return Math.round((currentImport.processedRecords / currentImport.totalRecords) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Land Registry Data Import</h2>
          <p className="text-gray-600 mt-1">Import property data from Land Registry CSV files</p>
        </div>
        <Button onClick={downloadTemplate} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Import Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Imported</p>
                <p className="text-2xl font-bold text-green-600">
                  {importHistory.reduce((sum, item) => sum + item.successfulRecords, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {importHistory
                    .filter(item => {
                      const itemDate = new Date(item.createdAt);
                      const now = new Date();
                      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, item) => sum + item.successfulRecords, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Records</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {importHistory.reduce((sum, item) => sum + item.failedRecords, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Import</p>
                <p className="text-sm font-bold text-purple-600">
                  {importHistory.length > 0
                    ? formatDistanceToNow(new Date(importHistory[0].createdAt), { addSuffix: true })
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Upload Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : 'Drop your CSV file here'}
                </p>
                <p className="text-xs text-gray-500 mb-4">or click to browse files</p>
                <Button variant="outline" className="mb-2" disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-gray-400">Supported formats: .csv (max 50MB)</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              
              {validationResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validation</span>
                    <span className={`text-sm ${validationResults.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResults.isValid ? '✓ Schema Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  {validationResults.totalRecords > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Records Found</span>
                        <span className="text-sm text-gray-600">{validationResults.totalRecords.toLocaleString()} rows</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Valid Records</span>
                        <span className="text-sm text-green-600">{validationResults.validRecords.toLocaleString()}</span>
                      </div>
                      {validationResults.invalidRecords > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Invalid Records</span>
                          <span className="text-sm text-red-600">{validationResults.invalidRecords.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              <Button 
                onClick={startImport}
                disabled={!selectedFile || isUploading || !validationResults?.isValid}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Import Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentImport ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Records</span>
                      <span>
                        {currentImport.processedRecords.toLocaleString()} / {currentImport.totalRecords.toLocaleString()} ({calculateProgress()}%)
                      </span>
                    </div>
                    <Progress value={calculateProgress()} className="w-full" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(currentImport.status)}
                        <Badge className={getStatusColor(currentImport.status)}>
                          {currentImport.status.charAt(0).toUpperCase() + currentImport.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Successful</span>
                      <span className="text-sm text-green-600">{currentImport.successfulRecords.toLocaleString()} records</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Failed</span>
                      <span className="text-sm text-red-600">{currentImport.failedRecords.toLocaleString()} records</span>
                    </div>
                    {currentImport.estimatedCompletion && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estimated Time</span>
                        <span className="text-sm text-gray-600">{currentImport.estimatedCompletion}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {currentImport.failedRecords > 0 && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => downloadErrorReport(currentImport.importId)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Error Report
                      </Button>
                    )}
                    {['pending', 'processing'].includes(currentImport.status) && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => cancelImport(currentImport.importId)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No active import</p>
                  <p className="text-xs text-gray-400">Upload a CSV file to start importing</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Imports
              </div>
              <Button variant="outline" size="sm" onClick={loadImportHistory} disabled={isLoadingHistory}>
                <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importHistory.slice(0, 5).map((item) => (
                <div key={item.importId} className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(item.status)}`}>
                  <div>
                    <p className="text-sm font-medium">{item.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {item.successfulRecords.toLocaleString()} records • {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusIcon(item.status)}
                </div>
              ))}
              {importHistory.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No import history</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Validation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Schema Validation</span>
                    <span className={`text-sm ${validationResults.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResults.isValid ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Records</span>
                    <span className="text-sm text-gray-600">{validationResults.totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Valid Records</span>
                    <span className="text-sm text-green-600">{validationResults.validRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Invalid Records</span>
                    <span className="text-sm text-red-600">{validationResults.invalidRecords.toLocaleString()}</span>
                  </div>
                  {validationResults.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-600 mb-2">Validation Errors:</p>
                      <ul className="text-xs text-red-500 space-y-1">
                        {validationResults.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {validationResults.errors.length > 3 && (
                          <li>• ... and {validationResults.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Upload a file to see validation results</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Import Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Field Mapping
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Validation Rules
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-Processing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandRegistryImport;