import React from 'react';
import { Metadata } from "next";
import AdvanceSearch from '@/app/components/inventory-list/search'; // Path updated to inventory
import { InventoryContextProvider } from '@/context-api/inventoryContext'; // Context provider wrap karna zaroori hai

export const metadata: Metadata = {
  title: "Inventory List | inventory-pro",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category || ''; 

  return (
    <div className="pt-20 bg-light dark:bg-darkmode min-h-screen">
      <InventoryContextProvider>
        <AdvanceSearch category={category} />
      </InventoryContextProvider>
    </div>
  );
};

export default Page;