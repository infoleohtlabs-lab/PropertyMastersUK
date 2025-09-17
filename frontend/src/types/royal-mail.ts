// Royal Mail PAF API Types

export interface RoyalMailAddress {
  uprn: string;
  address: string;
  buildingNumber?: string;
  buildingName?: string;
  subBuildingName?: string;
  organisationName?: string;
  departmentName?: string;
  thoroughfareName?: string;
  dependentThoroughfareName?: string;
  doubleDependentLocality?: string;
  dependentLocality?: string;
  postTown: string;
  postcode: string;
  postcodeType?: string;
  deliveryPointSuffix?: string;
  welshDependentLocality?: string;
  welshDependentThoroughfareName?: string;
  welshDoubleDependentLocality?: string;
  welshPostTown?: string;
  welshThoroughfareName?: string;
  poBoxNumber?: string;
  processDate?: string;
  startDate?: string;
  endDate?: string;
  lastUpdateDate?: string;
  entryDate?: string;
}

export interface PostcodeValidationResponse {
  isValid: boolean;
  postcode?: string;
  message?: string;
}

export interface AddressSearchResponse {
  addresses: RoyalMailAddress[];
  totalResults: number;
  message?: string;
}

export interface AddressLookupResponse {
  address: RoyalMailAddress | null;
  message?: string;
}

export interface RoyalMailApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Component Props Types
export interface PostcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: RoyalMailAddress) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoLookup?: boolean;
}

export interface AddressSearchProps {
  onAddressSelect: (address: RoyalMailAddress) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialQuery?: string;
}

export interface AddressDropdownProps {
  addresses: RoyalMailAddress[];
  onSelect: (address: RoyalMailAddress) => void;
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// Hook Types
export interface UsePostcodeValidationResult {
  isValid: boolean | null;
  isLoading: boolean;
  error: string | null;
  validatePostcode: (postcode: string) => Promise<void>;
}

export interface UseAddressSearchResult {
  addresses: RoyalMailAddress[];
  isLoading: boolean;
  error: string | null;
  searchAddresses: (query: string) => Promise<void>;
  getAddressesByPostcode: (postcode: string) => Promise<void>;
  clearResults: () => void;
}

export interface UseAddressLookupResult {
  address: RoyalMailAddress | null;
  isLoading: boolean;
  error: string | null;
  lookupAddress: (uprn: string) => Promise<void>;
}

// Form Integration Types
export interface AddressFormData {
  postcode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  uprn?: string;
}

export interface AddressFormProps {
  onAddressChange: (address: AddressFormData) => void;
  initialAddress?: Partial<AddressFormData>;
  required?: boolean;
  className?: string;
}