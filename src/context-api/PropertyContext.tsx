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
    location: '',
    region: '',
    status: '',
    category: '',
    beds: '',
    baths: '',
    garages: '',
    tag: '',
  });

  // Extract fetchProperties into useCallback so it can be exposed via Context
  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/propertydata');
      const data = await res.json();
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

  // Filtering logic
  useEffect(() => {
    const filteredProperties = allProperties.filter((property) => {
      return (
        (!filters.keyword ||
          property.property_title
            ?.toLowerCase()
            .includes(filters.keyword.toLowerCase())) &&
        (!filters.location ||
          property.location?.toLowerCase() === filters.location.toLowerCase()) &&
        (!filters.tag ||
          property.tag?.toLowerCase() === filters.tag.toLowerCase()) &&
        (!filters.status || property.status === filters.status) &&
        (!filters.category ||
          property.category?.toLowerCase() ===
            filters.category.toLowerCase()) &&
        (!filters.beds || property.beds === Number(filters.beds)) &&
        (!filters.garages || property.garages === Number(filters.garages))
      );
    });

    setProperties(filteredProperties);
  }, [filters, allProperties]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Dynamic Add Property Handler
  const addProperty = async (newProp: Partial<propertyData>): Promise<boolean> => {
    try {
      const res = await fetch('/api/propertydata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProp),
      });

      if (res.ok) {
        const savedProperty = await res.json();
        setAllProperties((prev) => [savedProperty, ...prev]);
        return true;
      } else {
        console.error('Failed to save property to database');
        return false;
      }
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
        setAllProperties((prev) =>
          prev.filter((item) => (item as any).id !== id)
        );
      } else {
        alert('Failed to delete property from database.');
      }
    } catch (error) {
      console.error('Delete error:', error);
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