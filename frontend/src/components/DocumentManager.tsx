import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Share2, 
  Filter, 
  Search, 
  Plus,
  FileText,
  Image,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Lock,
  Unlock,
  History,
  X
} from 'lucide-react';
import { 
  documentService, 
  DocumentMetadata, 
  DocumentCategory, 
  AccessLevel, 
  DocumentSearchFilters,
  DocumentUploadOptions,
  BulkUploadResult
} from '../services/documentService';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DocumentManagerProps {
  propertyId?: string;
  tenancyId?: string;
  userId?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  categories?: DocumentCategory[];
  className?: string;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  propertyId,
  tenancyId,
  userId,
  allowUpload = true,
  allowDelete = false,
  categories,
  className = ''
}) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DocumentSearchFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | ''>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | ''>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [previewDocument, setPreviewDocument] = useState<DocumentMetadata | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'filename' | 'size'>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const searchFilters: DocumentSearchFilters = {
        ...filters,
        propertyId,
        tenancyId,
        ...(userId && { uploadedBy: userId })
      };

      if (selectedCategory) searchFilters.category = selectedCategory;
      if (selectedAccessLevel) searchFilters.accessLevel = selectedAccessLevel;

      const response = await documentService.getDocuments(searchFilters, currentPage, 20);
      setDocuments(response.documents);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, propertyId, tenancyId, userId, selectedCategory, selectedAccessLevel, currentPage]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Filter documents by search term
  const filteredDocuments = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle file upload
  const handleFileUpload = async (files: FileList, options: DocumentUploadOptions) => {
    const fileArray = Array.from(files);
    const progressArray: UploadProgress[] = fileArray.map(file => ({
      filename: file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(progressArray);

    try {
      const result: BulkUploadResult = await documentService.bulkUploadDocuments(fileArray, options);
      
      // Update progress for successful uploads
      result.successful.forEach((doc, index) => {
        progressArray[index] = {
          filename: doc.originalName,
          progress: 100,
          status: 'success'
        };
      });

      // Update progress for failed uploads
      result.failed.forEach(failure => {
        const index = progressArray.findIndex(p => p.filename === failure.filename);
        if (index !== -1) {
          progressArray[index] = {
            filename: failure.filename,
            progress: 0,
            status: 'error',
            error: failure.error
          };
        }
      });

      setUploadProgress([...progressArray]);
      
      // Refresh documents list
      await loadDocuments();
      
      // Clear progress after 3 seconds
      setTimeout(() => setUploadProgress([]), 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(progressArray.map(p => ({ ...p, status: 'error', error: 'Upload failed' })));
    }
  };

  // Handle document download
  const handleDownload = async (document: DocumentMetadata) => {
    try {
      const blob = await documentService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId, 'User requested deletion');
      await loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get access level color
  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case AccessLevel.PUBLIC: return 'text-green-600 bg-green-100';
      case AccessLevel.PRIVATE: return 'text-blue-600 bg-blue-100';
      case AccessLevel.RESTRICTED: return 'text-yellow-600 bg-yellow-100';
      case AccessLevel.CONFIDENTIAL: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Document Manager</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            {allowUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Documents
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {Object.values(DocumentCategory).map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <select
                  value={selectedAccessLevel}
                  onChange={(e) => setSelectedAccessLevel(e.target.value as AccessLevel | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Access Levels</option>
                  {Object.values(AccessLevel).map(level => (
                    <option key={level} value={level}>
                      {level.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as typeof sortBy);
                    setSortOrder(order as typeof sortOrder);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uploadedAt-desc">Newest First</option>
                  <option value="uploadedAt-asc">Oldest First</option>
                  <option value="filename-asc">Name A-Z</option>
                  <option value="filename-desc">Name Z-A</option>
                  <option value="size-desc">Largest First</option>
                  <option value="size-asc">Smallest First</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Upload Progress</h3>
          <div className="space-y-2">
            {uploadProgress.map((progress, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{progress.filename}</span>
                    <div className="flex items-center space-x-2">
                      {progress.status === 'uploading' && <Clock className="w-4 h-4 text-blue-500" />}
                      {progress.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {progress.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${
                        progress.status === 'success' ? 'text-green-600' :
                        progress.status === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {progress.status === 'success' ? 'Complete' :
                         progress.status === 'error' ? 'Failed' : 'Uploading...'}
                      </span>
                    </div>
                  </div>
                  {progress.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                  {progress.error && (
                    <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <File className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {document.originalName}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getAccessLevelColor(document.accessLevel)
                      }`}>
                        {document.accessLevel === AccessLevel.PUBLIC ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                        {document.accessLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {document.uploadedBy}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                      </span>
                      <span>{formatFileSize(document.size)}</span>
                      <span className="capitalize">{document.category.replace('_', ' ')}</span>
                    </div>
                    {document.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        {document.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {documentService.canPreview(document.mimeType) && (
                    <button
                      onClick={() => setPreviewDocument(document)}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(document)}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Version History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  {allowDelete && (
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 focus:outline-none"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          categories={categories}
          propertyId={propertyId}
          tenancyId={tenancyId}
        />
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <PreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

// Upload Modal Component
interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: FileList, options: DocumentUploadOptions) => void;
  categories?: DocumentCategory[];
  propertyId?: string;
  tenancyId?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, categories, propertyId, tenancyId }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PRIVATE);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    const options: DocumentUploadOptions = {
      category,
      accessLevel,
      description: description.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      expiryDate: expiryDate || undefined,
      propertyId,
      tenancyId
    };

    onUpload(selectedFiles, options);
    onClose();
  };

  const availableCategories = categories || Object.values(DocumentCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PDF, DOC, XLS, JPG, PNG, GIF, TXT, CSV up to 50MB each
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files</h4>
              <div className="space-y-2">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level *</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(AccessLevel).map(level => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description for the documents..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Comma-separated tags (e.g., contract, legal, important)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Documents
          </button>
        </div>
      </div>
    </div>
  );
};

// Preview Modal Component
interface PreviewModalProps {
  document: DocumentMetadata;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ document, onClose }) => {
  const previewUrl = documentService.getPreviewUrl(document.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{document.originalName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 h-[calc(90vh-120px)]">
          {document.mimeType.startsWith('image/') ? (
            <img
              src={previewUrl}
              alt={document.originalName}
              className="max-w-full max-h-full object-contain mx-auto"
            />
          ) : document.mimeType === 'application/pdf' ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title={document.originalName}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <File className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
                <p className="mt-1 text-sm text-gray-500">This file type cannot be previewed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;