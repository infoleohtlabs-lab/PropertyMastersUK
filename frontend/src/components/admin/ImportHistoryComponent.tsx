import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  Eye,
  RotateCcw,
  X,
  Pause,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, ImportJob, ImportJobQuery, ImportJobStatus } from '../../services/adminService';

interface ImportHistoryComponentProps {
  onJobSelect?: (job: ImportJob) => void;
  refreshTrigger?: number;
  className?: string;
}

const ImportHistoryComponent: React.FC<ImportHistoryComponentProps> = ({
  onJobSelect,
  refreshTrigger,
  className = ''
}) => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [jobProgress, setJobProgress] = useState<Record<string, number>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<ImportJobQuery>({
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ImportJobStatus | ''>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Load import jobs
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const query: ImportJobQuery = {
        ...filters,
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      };
      
      const response = await adminService.getImportJobs(query);
      setJobs(response.jobs);
      setTotalJobs(response.total);
    } catch (error) {
      toast.error('Failed to load import jobs');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, searchTerm, statusFilter, dateRange]);

  // Load jobs on mount and when dependencies change
  useEffect(() => {
    loadJobs();
  }, [loadJobs, refreshTrigger]);

  // Auto-refresh for processing jobs
  useEffect(() => {
    const hasProcessingJobs = jobs.some(job => 
      ['processing', 'validating', 'uploaded'].includes(job.status)
    );

    if (autoRefresh && hasProcessingJobs) {
      intervalRef.current = setInterval(() => {
        loadJobs();
        updateJobProgress();
      }, 3000); // Refresh every 3 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobs, autoRefresh, loadJobs]);

  // Update job progress
  const updateJobProgress = useCallback(async () => {
    const processingJobs = jobs.filter(job => 
      ['processing', 'validating'].includes(job.status)
    );

    for (const job of processingJobs) {
      try {
        const progressData = await adminService.getImportJobProgress(job.id);
        setJobProgress(prev => ({
          ...prev,
          [job.id]: progressData.progress
        }));
      } catch (error) {
        // Silently handle progress fetch errors
      }
    }
  }, [jobs]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Handle status filter
  const handleStatusFilter = useCallback((status: ImportJobStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  // Handle date range filter
  const handleDateRangeFilter = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
    setCurrentPage(1);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  }, []);

  // Handle job selection
  const handleJobSelection = useCallback((jobId: string, selected: boolean) => {
    const newSelection = new Set(selectedJobs);
    if (selected) {
      newSelection.add(jobId);
    } else {
      newSelection.delete(jobId);
    }
    setSelectedJobs(newSelection);
  }, [selectedJobs]);

  // Select all jobs
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedJobs(new Set(jobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  }, [jobs]);

  // Delete job
  const handleDeleteJob = useCallback(async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this import job?')) {
      return;
    }
    
    try {
      await adminService.deleteImportJob(jobId);
      await loadJobs();
    } catch (error) {
      toast.error('Failed to delete import job');
    }
  }, [loadJobs]);

  // Bulk delete jobs
  const handleBulkDelete = useCallback(async () => {
    if (selectedJobs.size === 0) {
      toast.error('No jobs selected');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedJobs.size} import jobs?`)) {
      return;
    }
    
    try {
      await adminService.bulkDeleteImportJobs(Array.from(selectedJobs));
      setSelectedJobs(new Set());
      await loadJobs();
    } catch (error) {
      toast.error('Failed to delete import jobs');
    }
  }, [selectedJobs, loadJobs]);

  // Retry job
  const handleRetryJob = useCallback(async (jobId: string) => {
    try {
      await adminService.retryImportJob(jobId);
      await loadJobs();
    } catch (error) {
      toast.error('Failed to retry import job');
    }
  }, [loadJobs]);

  // Export processed data
  const handleExportData = useCallback(async (jobId: string) => {
    try {
      await adminService.exportProcessedData(jobId, 'csv');
    } catch (error) {
      toast.error('Failed to export processed data');
    }
  }, []);

  // Cancel job
  const handleCancelJob = useCallback(async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this import job?')) {
      return;
    }
    
    try {
      await adminService.cancelImportJob(jobId);
      await loadJobs();
      toast.success('Import job cancelled');
    } catch (error) {
      toast.error('Failed to cancel import job');
    }
  }, [loadJobs]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Get status color
  const getStatusColor = (status: ImportJobStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing_failed':
      case 'validation_failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'validating':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / pageSize);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Import History</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              autoRefresh 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            Auto-refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as ImportJobStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="uploaded">Uploaded</option>
                <option value="validating">Validating</option>
                <option value="validated">Validated</option>
                <option value="validation_failed">Validation Failed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="processing_failed">Processing Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeFilter(e.target.value, dateRange.end)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeFilter(dateRange.start, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedJobs.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {selectedJobs.size} job(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading import jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No import jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedJobs.size === jobs.length && jobs.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(job.id)}
                        onChange={(e) => handleJobSelection(job.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.filename}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(job.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {['processing', 'validating'].includes(job.status) && (
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{jobProgress[job.id] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${jobProgress[job.id] || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600">
                        {job.stats && (
                          <div>
                            <div>Total: {job.stats.totalRows || 0}</div>
                            <div>Valid: {job.stats.validRows || 0}</div>
                            {job.stats.errors && job.stats.errors > 0 && (
                              <div className="text-red-600">Errors: {job.stats.errors}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600">
                        <div>{formatDate(job.createdAt)}</div>
                        {job.uploadedByUser && (
                          <div className="text-gray-500">by {job.uploadedByUser.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onJobSelect?.(job)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {job.status === 'completed' && (
                          <button
                            onClick={() => handleExportData(job.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Export Data"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        {['processing', 'validating', 'uploaded'].includes(job.status) && (
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            className="p-1 text-gray-400 hover:text-orange-600"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {['processing_failed', 'validation_failed'].includes(job.status) && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportHistoryComponent;