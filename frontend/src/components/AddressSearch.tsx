'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, X, Building } from 'lucide-react';
import { AddressSearchProps, RoyalMailAddress } from '../types/royal-mail';
import { royalMailService } from '../services/royal-mail.service';

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  placeholder = 'Search for an address...',
  className = '',
  disabled = false,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [addresses, setAddresses] = useState<RoyalMailAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setAddresses([]);
      setShowDropdown(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await royalMailService.searchAddresses(searchQuery, 10);
      setAddresses(result.addresses);
      setShowDropdown(result.addresses.length > 0);
      setSelectedIndex(-1);
      
      if (result.addresses.length === 0) {
        setError('No addresses found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setError('Error searching addresses. Please try again.');
      setAddresses([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchAddresses(newQuery);
    }, 300);
  };

  // Handle address selection
  const handleAddressSelect = (address: RoyalMailAddress) => {
    const formattedAddress = royalMailService.formatAddress(address);
    setQuery(formattedAddress);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onAddressSelect(address);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || addresses.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < addresses.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < addresses.length) {
          handleAddressSelect(addresses[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setAddresses([]);
    setShowDropdown(false);
    setError('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (addresses.length > 0) {
      setShowDropdown(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
          }`}
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Search className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600"
            type="button"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching addresses...
            </div>
          ) : addresses.length > 0 ? (
            <>
              <div className="p-2 text-xs text-gray-500 border-b bg-gray-50">
                {addresses.length} address{addresses.length !== 1 ? 'es' : ''} found
              </div>
              {addresses.map((address, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={address.uprn}
                    data-index={index}
                    onClick={() => handleAddressSelect(address)}
                    className={`w-full p-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 focus:bg-gray-50'
                    } focus:outline-none`}
                  >
                    <div className="flex items-start space-x-3">
                      <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {royalMailService.formatAddress(address)}
                        </div>
                        {address.uprn && (
                          <div className="text-xs text-gray-500 mt-1">
                            UPRN: {address.uprn}
                          </div>
                        )}
                        {(address.buildingName || address.organisationName) && (
                          <div className="text-xs text-blue-600 mt-1">
                            {address.buildingName || address.organisationName}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : query.length >= 3 && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No addresses found</p>
              <p className="text-xs mt-1">Try searching with a postcode, street name, or building name</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Search Instructions */}
      {!query && !showDropdown && (
        <p className="mt-1 text-xs text-gray-500">
          Start typing an address, postcode, or building name to search
        </p>
      )}
    </div>
  );
};

export default AddressSearch;