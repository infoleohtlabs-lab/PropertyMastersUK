'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, AlertCircle, Check } from 'lucide-react';
import { PostcodeInputProps, RoyalMailAddress } from '../types/royal-mail';
import { royalMailService } from '../services/royal-mail.service';
import { isValidUKPostcode } from '../utils';

const PostcodeInput: React.FC<PostcodeInputProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Enter postcode (e.g. SW1A 1AA)',
  className = '',
  disabled = false,
  autoLookup = true
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [addresses, setAddresses] = useState<RoyalMailAddress[]>([]);
  const [showAddresses, setShowAddresses] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced validation function
  const validatePostcode = useCallback(async (postcode: string) => {
    if (!postcode.trim()) {
      setIsValid(null);
      setValidationMessage('');
      setAddresses([]);
      setShowAddresses(false);
      return;
    }

    // First check with regex for basic format
    if (!isValidUKPostcode(postcode)) {
      setIsValid(false);
      setValidationMessage('Invalid postcode format');
      setAddresses([]);
      setShowAddresses(false);
      return;
    }

    setIsValidating(true);
    
    try {
      // Validate with Royal Mail API
      const validationResult = await royalMailService.validatePostcode(postcode);
      
      setIsValid(validationResult.isValid);
      setValidationMessage(validationResult.message || '');
      
      // If valid and autoLookup is enabled, fetch addresses
      if (validationResult.isValid && autoLookup && onAddressSelect) {
        setIsLoadingAddresses(true);
        try {
          const addressResult = await royalMailService.getAddressesByPostcode(postcode);
          setAddresses(addressResult.addresses);
          setShowAddresses(addressResult.addresses.length > 0);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setAddresses([]);
          setShowAddresses(false);
        } finally {
          setIsLoadingAddresses(false);
        }
      } else {
        setAddresses([]);
        setShowAddresses(false);
      }
    } catch (error) {
      console.error('Error validating postcode:', error);
      setIsValid(false);
      setValidationMessage('Error validating postcode');
      setAddresses([]);
      setShowAddresses(false);
    } finally {
      setIsValidating(false);
    }
  }, [autoLookup, onAddressSelect]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      validatePostcode(newValue);
    }, 500);
  };

  // Handle address selection
  const handleAddressSelect = (address: RoyalMailAddress) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    setShowAddresses(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddresses(false);
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

  // Get validation icon
  const getValidationIcon = () => {
    if (isValidating) {
      return <Search className="h-4 w-4 animate-spin text-gray-400" />;
    }
    if (isValid === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <MapPin className="h-4 w-4 text-gray-400" />;
  };

  // Get input border color based on validation state
  const getBorderColor = () => {
    if (isValid === true) return 'border-green-500 focus:border-green-500';
    if (isValid === false) return 'border-red-500 focus:border-red-500';
    return 'border-gray-300 focus:border-blue-500';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
            getBorderColor()
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          maxLength={8}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getValidationIcon()}
        </div>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <p className={`mt-1 text-sm ${
          isValid === false ? 'text-red-600' : 'text-gray-600'
        }`}>
          {validationMessage}
        </p>
      )}

      {/* Address Dropdown */}
      {showAddresses && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoadingAddresses ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading addresses...
            </div>
          ) : addresses.length > 0 ? (
            <>
              <div className="p-2 text-xs text-gray-500 border-b">
                {addresses.length} address{addresses.length !== 1 ? 'es' : ''} found
              </div>
              {addresses.map((address) => (
                <button
                  key={address.uprn}
                  onClick={() => handleAddressSelect(address)}
                  className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {royalMailService.formatAddress(address)}
                  </div>
                  {address.uprn && (
                    <div className="text-xs text-gray-500 mt-1">
                      UPRN: {address.uprn}
                    </div>
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No addresses found for this postcode
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostcodeInput;