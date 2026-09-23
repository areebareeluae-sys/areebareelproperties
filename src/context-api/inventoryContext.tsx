'use client';

import { Filters } from '@/app/types/inventory/filtertypes';
import { Inventory } from '@/app/types/inventory/inventoryData';
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';

interface InventoryContextType {
  inventoryList: Inventory[];
  setInventoryList: Dispatch<SetStateAction<Inventory[]>>;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  updateFilter: (key: keyof Filters, value: string) => void;
  addInventory: (newInv: Partial<Inventory>) => Promise<boolean>;
  deleteInventory: (id: string) => Promise<void>;
  fetchInventory: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allInventory, setAllInventory] = useState<Inventory[]>([]);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
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

  // Fetch Inventory Data from the Inventory API endpoint
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventorydata'); 
      const result = await res.json();
      
      const data = Array.isArray(result) ? result : result.data;

      if (Array.isArray(data)) {
        setAllInventory(data);
        setInventoryList(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filtering logic
  useEffect(() => {
    const filteredInventory = allInventory.filter((item) => {
      return (
        (!filters.keyword ||
          item.property_title
            ?.toLowerCase()
            .includes(filters.keyword.toLowerCase())) &&
        (!filters.location ||
          item.location?.toLowerCase() === filters.location.toLowerCase()) &&
        (!filters.tag ||
          item.tag?.toLowerCase() === filters.tag.toLowerCase()) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.category ||
          item.category?.toLowerCase() ===
            filters.category.toLowerCase()) &&
        (!filters.beds || item.beds === Number(filters.beds)) &&
        (!filters.garages || item.garages === Number(filters.garages))
      );
    });

    setInventoryList(filteredInventory);
  }, [filters, allInventory]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Add Inventory Handler
  const addInventory = async (newInv: Partial<Inventory>): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventorydata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInv),
      });

      if (res.ok) {
        const savedInventory = await res.json();
        setAllInventory((prev) => [savedInventory, ...prev]);
        return true;
      } else {
        console.error('Failed to save inventory to database');
        return false;
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
      return false;
    }
  };

  // Delete Inventory Handler
  const deleteInventory = async (id: string) => {
    try {
      const res = await fetch(`/api/inventorydata?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAllInventory((prev) =>
          prev.filter((item) => item.id !== id)
        );
      } else {
        alert('Failed to delete inventory from database.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventoryList,
        setInventoryList,
        filters,
        setFilters,
        updateFilter,
        addInventory,
        deleteInventory,
        fetchInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};