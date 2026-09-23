'use client';

import { Filters } from '@/app/types/property/filtertypes';
import { propertyData } from '@/app/types/property/propertyData';
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';

interface PropertyContextType {
  properties: propertyData[];
  setProperties: Dispatch<SetStateAction<propertyData[]>>;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  updateFilter: (key: keyof Filters, value: string) => void;
  addProperty: (newProp: Partial<propertyData>) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<void>;
  fetchProperties: () => Promise<void>;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allProperties, setAllProperties] = useState<propertyData[]>([]);
  const [properties, setProperties] = useState<propertyData[]>([]);
  const [filters, setFilters] = useState<Filters>({
    keyword: '',
    property_type: '',
    country: '',
    city: '',
    area: '',
    location: '',
    region: '',
    status: '',
    category: '',
    tag: '',
    beds: '',
    baths: '',
    garages: '',
    area_size: '',
    distance: '',
    minPrice: '',
    maxPrice: '', // <-- Added maxPrice to match your interface
  });

  // Extract fetchProperties into useCallback so it can be exposed via Context
  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/propertydata');
      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data;
      
      if (Array.isArray(data)) {
        setAllProperties(data);
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addProperty = async (newProp: Partial<propertyData>): Promise<boolean> => {
    try {
      const res = await fetch('/api/propertydata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      });
      if (res.ok) {
        await fetchProperties();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding property:', error);
      return false;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/propertydata?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAllProperties((prev) => prev.filter((p: any) => p.id !== id));
        setProperties((prev) => prev.filter((p: any) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        setProperties,
        filters,
        setFilters,
        updateFilter,
        addProperty,
        deleteProperty,
        fetchProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};