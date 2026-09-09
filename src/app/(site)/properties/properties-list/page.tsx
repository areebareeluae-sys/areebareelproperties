import React from 'react';
import { Metadata } from "next";
import AdvanceSearch from '@/app/components/property-list/search';

export const metadata: Metadata = {
  title: "Properties List",
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
    <>
      <AdvanceSearch category={category} />
    </>
  );
};

export default Page;