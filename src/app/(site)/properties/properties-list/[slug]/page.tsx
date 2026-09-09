"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import Image from 'next/image';
import CompanyInfo from '@/app/components/home/info';
import Availability from '@/app/components/property-details/availability';
import Tabbar from '@/app/components/property-details/tabbar';
import TextSection from '@/app/components/property-details/text-section';
import DiscoverProperties from '@/app/components/home/property-option';

export default function Details() {
  const { slug } = useParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/propertydata');
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const item = properties.find((p) => p.slug === slug);

  if (loading) {
    return <div className="text-center py-32 text-xl font-semibold dark:text-white">Loading property details...</div>;
  }

  if (!item) {
    return <div className="text-center py-32 text-xl font-semibold dark:text-white">Property not found!</div>;
  }

  return (
    <div>
      {/* Title & Location Header */}
      <section className="bg-cover pt-36 pb-10 relative bg-gradient-to-b from-white from-10% dark:from-darkmode to-herobg to-90% dark:to-darklight overflow-x-hidden">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 text-center">
          <span className="text-sm font-bold bg-primary text-white py-1 px-3 rounded-md uppercase tracking-wider inline-block mb-3">
            {item.tag || 'For Sale'}
          </span>
          <h2 className="text-midnight_text text-3xl lg:text-[45px] leading-[1.2] font-bold dark:text-white mb-3">
            {item.property_title}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-300">
            📍 {item.location} | Category: <span className="font-semibold text-primary">{item.category}</span>
          </p>
        </div>
      </section>

      {/* Main Image */}
      <section className="pb-10">
        <div className='container mx-auto px-4 dark:bg-darkmode'>
          <div className="h-[450px] lg:h-[580px] max-w-5xl mx-auto w-full">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.property_title || 'Property'}
                width={1000}
                height={600}
                className='h-full w-full object-cover rounded-xl shadow-lg'
              />
            ) : (
              <div className="h-full w-full bg-gray-200 dark:bg-darklight flex items-center justify-center rounded-xl">
                No Image Available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Property Key Information & Specs Bar */}
      <section className="pb-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white dark:bg-darklight shadow-property rounded-xl p-6 sm:p-8 border border-border dark:border-dark_border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            
            {/* Price */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">
                RS: {Number(item.price).toLocaleString()}
              </span>
            </div>

            {/* Bedrooms */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bedrooms</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-2">
                🛏️ {item.beds}
              </span>
            </div>

            {/* Bathrooms */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bathrooms</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-2">
                🛁 {item.baths}
              </span>
            </div>

            {/* Garages */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Garages</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-2">
                🚗 {item.garages}
              </span>
            </div>

          </div>
        </div>
      </section>

      <TextSection />
      <CompanyInfo />
      <Tabbar />
      <Availability />
      <DiscoverProperties />
    </div>
  );
}