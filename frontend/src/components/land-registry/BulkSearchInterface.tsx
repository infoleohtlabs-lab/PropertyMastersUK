import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  Download, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { BulkSearchRequest, BulkSearchResult } from '@/types/land-registry';

interface BulkSearchInterfaceProps {
  onSearchComplete?: (result: BulkSearchResult) => void;
}

type SearchType = 'ownership' | 'price_paid' | 'both';

export const BulkSearchInterface: React.FC<BulkSearchInterfaceProps> = ({
  onSearchComplete
}) => {
  const [postcodes, setPostcodes] = useState('');
  const [titleNumbers, setTitleNumbers] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('both');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [maxResults, setMaxResults] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<BulkSearchResult | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const validateInput = (): string | null => {
    const postcodeList = postcodes.trim().split('\n').filter(p => p.trim());
    const titleNumberList = titleNumbers.trim().split('\n').filter(t => t.trim());
    
    if (postcodeList.length === 0 && titleNumberList.length === 0) {
      return 'Please provide at least one postcode or title number';
    }
    
    if (postcodeList.length + titleNumberList.length > 100) {
      return 'Maximum 100 items allowed per search';
    }
    
    if (maxResults < 1 || maxResults > 10000) {
      return 'Max results must be between 1 and 10,000';
    }
    
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      return 'Date from must be before date to';
    }
    
    return null;
  };

  const startBulkSearch = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const postcodeList = postcodes.trim().split('\n').filter(p => p.trim());
      const titleNumberList = titleNumbers.trim().split('\n').filter(t => t.trim());
      
      const request: BulkSearchRequest = {
        search_type: searchType,
        max_results: maxResults
      };
      
      if (postcodeList.length > 0) {
        request.postcodes = postcodeList;
      }
      
      if (titleNumberList.length > 0) {
        request.title_numbers = titleNumberList;
      }
      
      if (dateFrom) request.date_from = dateFrom;
      if (dateTo) request.date_to = dateTo;

      const response = await fetch('/api/land-registry/bulk-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to start bulk search: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSearchResult(result.data);
        startPolling(result.data.request_id);
      } else {
        throw new Error(result.error?.message || 'Failed to start bulk search');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const startPolling = (requestId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/land-registry/bulk-search/${requestId}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            setSearchResult(result.data);
            
            if (result.data.status === 'completed' || result.data.status === 'failed') {
              clearInterval(interval);
              setPollInterval(null);
              setLoading(false);
              
              if (result.data.status === 'completed') {
                onSearchComplete?.(result.data);
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds
    
    setPollInterval(interval);
  };

  const cancelSearch = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setLoading(false);
    setSearchResult(null);
  };

  const downloadResults = async () => {
    if (!searchResult || searchResult.status !== 'completed') return;
    
    try {
      const response = await fetch(`/api/land-registry/bulk-export/${searchResult.request_id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-search-${searchResult.request_id}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to download results');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  return (
    <div className="space-y-6">
      {/* Search Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Bulk Search Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Type */}
          <div>
            <Label>Search Type</Label>
            <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ownership">Ownership Records Only</SelectItem>
                <SelectItem value="price_paid">Price Paid Data Only</SelectItem>
                <SelectItem value="both">Both Ownership &amp; Price Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="postcodes">Postcodes (one per line)</Label>
              <Textarea
                id="postcodes"
                placeholder="SW1A 1AA\nW1A 0AX\nEC1A 1BB"
                value={postcodes}
                onChange={(e) => setPostcodes(e.target.value.toUpperCase())}
                disabled={loading}
                rows={6}
              />
              <p className="text-sm text-gray-600 mt-1">
                {postcodes.trim().split('\n').filter(p => p.trim()).length} postcodes
              </p>
            </div>
            
            <div>
              <Label htmlFor="titleNumbers">Title Numbers (one per line)</Label>
              <Textarea
                id="titleNumbers"
                placeholder="ABC123456\nDEF789012\nGHI345678"
                value={titleNumbers}
                onChange={(e) => setTitleNumbers(e.target.value.toUpperCase())}
                disabled={loading}
                rows={6}
              />
              <p className="text-sm text-gray-600 mt-1">
                {titleNumbers.trim().split('\n').filter(t => t.trim()).length} title numbers
              </p>
            </div>
          </div>

          {/* Date Range and Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Date From (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">Date To (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="maxResults">Max Results</Label>
              <Input
                id="maxResults"
                type="number"
                min="1"
                max="10000"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 1000)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={startBulkSearch} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {loading ? 'Processing...' : 'Start Bulk Search'}
            </Button>
            
            {loading && (
              <Button variant="outline" onClick={cancelSearch}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Progress */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(searchResult.status)}
                Search Progress
              </div>
              <Badge className={getStatusColor(searchResult.status)}>
                {searchResult.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            {searchResult.status === 'processing' && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Processing records...</span>
                  <span>{searchResult.processed_records} / {searchResult.total_records}</span>
                </div>
                <Progress 
                  value={(searchResult.processed_records / searchResult.total_records) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {/* Search Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Request ID</Label>
                <p className="font-mono text-sm">{searchResult.request_id}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Records</Label>
                <p className="text-lg font-semibold">{searchResult.total_records}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Processed</Label>
                <p className="text-lg font-semibold">{searchResult.processed_records}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Started</Label>
                <p className="text-sm">{new Date(searchResult.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Results Summary */}
            {searchResult.status === 'completed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {searchResult.results.properties && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {searchResult.results.properties.length}
                      </p>
                      <p className="text-sm text-blue-800">Properties Found</p>
                    </div>
                  )}
                  
                  {searchResult.results.ownership_records && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {searchResult.results.ownership_records.length}
                      </p>
                      <p className="text-sm text-green-800">Ownership Records</p>
                    </div>
                  )}
                  
                  {searchResult.results.price_paid_records && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {searchResult.results.price_paid_records.length}
                      </p>
                      <p className="text-sm text-purple-800">Price Paid Records</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={downloadResults} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Results (CSV)
                  </Button>
                </div>
              </div>
            )}

            {/* Errors */}
            {searchResult.errors && searchResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Errors encountered:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {searchResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkSearchInterface;