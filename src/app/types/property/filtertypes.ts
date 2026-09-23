export interface Filters {
  keyword?: string;
  property_type?: string; // Residential / Commercial
  country?: string;       // Pakistan / UAE
  city?: string;          // Lahore, Islamabad, Dubai, etc.
  area?: string;          // Gulberg III, Downtown, etc.
  location?: string;
  region?: string;
  status?: string;
  category?: string;      // Apartment, Villa, Office, etc.
  tag?: string;           // For Sale, For Rent, Off Plan
  beds?: string;
  baths?: string;
  garages?: string;
  area_size?: string;     // Min/Max ya exact Sq Ft filter ke liye
  distance?: string;
  minPrice?: string;
  maxPrice?: string;
}