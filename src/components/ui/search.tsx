import React from 'react';
import { cn } from '../../utils/cn';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Search, Filter, X, SlidersHorizontal, MapPin, Calendar, DollarSign } from 'lucide-react';

interface SearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showFilters?: boolean;
  filters?: SearchFilter[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  loading?: boolean;
}

interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'range' | 'date' | 'location';
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface QuickSearchProps {
  onSearch: (query: string, filters?: Record<string, any>) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
}

interface PropertySearchProps {
  onSearch: (filters: PropertySearchFilters) => void;
  initialFilters?: Partial<PropertySearchFilters>;
  className?: string;
}

interface PropertySearchFilters {
  query?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  dateFrom?: string;
  dateTo?: string;
}

const Search: React.FC<SearchProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  className,
  size = 'default',
  showFilters = false,
  filters = [],
  activeFilters = {},
  onFilterChange,
  suggestions = [],
  showSuggestions = false,
  loading = false
}) => {
  const [searchValue, setSearchValue] = React.useState(value || '');
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [showSuggestionPanel, setShowSuggestionPanel] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
    
    if (newValue && suggestions.length > 0) {
      setShowSuggestionPanel(true);
    } else {
      setShowSuggestionPanel(false);
    }
  };
  
  const handleSearch = () => {
    onSearch?.(searchValue);
    setShowSuggestionPanel(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    onFilterChange?.(newFilters);
  };
  
  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    onFilterChange?.(newFilters);
  };
  
  const activeFilterCount = Object.keys(activeFilters).length;
  
  return (
    <div className={cn('relative', className)} ref={searchRef}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            variant="search"
            size={size}
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rightIcon={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                loading={loading}
                className="h-6 w-6 p-0"
              >
                <Search className="w-4 h-4" />
              </Button>
            }
          />
          
          {/* Suggestions Panel */}
          {showSuggestions && showSuggestionPanel && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    setSearchValue(suggestion);
                    onChange?.(suggestion);
                    onSearch?.(suggestion);
                    setShowSuggestionPanel(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Filter Toggle */}
        {showFilters && (
          <Button
            variant="outline"
            size={size}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              'relative',
              activeFilterCount > 0 && 'border-blue-500 text-blue-600'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="primary"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
      
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const label = filter?.label || key;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span className="text-xs">
                  {label}: {String(value)}
                </span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                
                {filter.type === 'text' && (
                  <Input
                    size="sm"
                    placeholder={filter.placeholder}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                )}
                
                {filter.type === 'select' && (
                  <select
                    className="w-full h-8 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'range' && (
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      type="number"
                      placeholder="Min"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[`${filter.key}_min`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                    />
                    <Input
                      size="sm"
                      type="number"
                      placeholder="Max"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[`${filter.key}_max`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                    />
                  </div>
                )}
                
                {filter.type === 'date' && (
                  <Input
                    size="sm"
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onFilterChange?.({});
                setShowFilterPanel(false);
              }}
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilterPanel(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickSearch: React.FC<QuickSearchProps> = ({
  onSearch,
  placeholder = "Quick search...",
  suggestions = [],
  recentSearches = [],
  className
}) => {
  const [query, setQuery] = React.useState('');
  
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  return (
    <div className={cn('w-full max-w-md', className)}>
      <Search
        placeholder={placeholder}
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        suggestions={[...recentSearches, ...suggestions]}
        showSuggestions={true}
        size="lg"
      />
    </div>
  );
};

const PropertySearch: React.FC<PropertySearchProps> = ({
  onSearch,
  initialFilters = {},
  className
}) => {
  const [filters, setFilters] = React.useState<PropertySearchFilters>(initialFilters);
  
  const propertyFilters: SearchFilter[] = [
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter city, area, or postcode'
    },
    {
      key: 'propertyType',
      label: 'Property Type',
      type: 'select',
      options: [
        { value: 'house', label: 'House' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'studio', label: 'Studio' },
        { value: 'commercial', label: 'Commercial' }
      ]
    },
    {
      key: 'price',
      label: 'Price Range',
      type: 'range',
      min: 0,
      max: 10000000
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      type: 'select',
      options: [
        { value: '1', label: '1+' },
        { value: '2', label: '2+' },
        { value: '3', label: '3+' },
        { value: '4', label: '4+' },
        { value: '5', label: '5+' }
      ]
    }
  ];
  
  const handleFilterChange = (newFilters: Record<string, any>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };
  
  const handleSearch = (query: string) => {
    const searchFilters = { ...filters, query };
    onSearch(searchFilters);
  };
  
  return (
    <div className={cn('w-full', className)}>
      <Search
        placeholder="Search properties..."
        value={filters.query || ''}
        onChange={(query) => setFilters({ ...filters, query })}
        onSearch={handleSearch}
        showFilters={true}
        filters={propertyFilters}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        size="lg"
      />
    </div>
  );
};

export { Search, QuickSearch, PropertySearch };
export type { SearchProps, QuickSearchProps, PropertySearchProps, SearchFilter, PropertySearchFilters };