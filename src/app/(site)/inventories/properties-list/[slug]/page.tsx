"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import Image from 'next/image';
import CompanyInfo from '@/app/components/home/info';
import Tabbar from '@/app/components/property-details/tabbar';
import TextSection from '@/app/components/property-details/text-section';

export default function InventoryDetails() {
  const { slug } = useParams();
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/inventorydata');
        if (!res.ok) throw new Error('Failed to fetch');

        const jsonRes = await res.json();
        const data = Array.isArray(jsonRes) ? jsonRes : (jsonRes.data || []);
        setInventoryList(data);
      } catch (error) {
        console.error('Error fetching inventory details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Slug ya ID se item find karna
  const item = inventoryList.find((p) => p.slug === slug || p.id?.toString() === slug);

  // Images list parsing (JSON array ya string handle karne ke liye)
  let imagesList: string[] = [];
  if (item) {
    if (item.images) {
      if (Array.isArray(item.images)) {
        imagesList = item.images;
      } else if (typeof item.images === 'string') {
        try {
          imagesList = JSON.parse(item.images);
        } catch (e) {
          imagesList = [item.images];
        }
      }
    }
    if (imagesList.length === 0 && item.image) {
      imagesList = [item.image];
    }
  }

  useEffect(() => {
    if (imagesList.length > 0 && !selectedImage) {
      setSelectedImage(imagesList[0]);
    }
  }, [imagesList, selectedImage]);

  // --- Loader jab tak data fetch ho raha hai ---
  if (loading) {
    return (
      <div className="pt-20 bg-light dark:bg-darkmode min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
            Loading inventory details...
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-20 bg-light dark:bg-darkmode min-h-screen flex items-center justify-center">
        <div className="text-center text-xl font-semibold text-gray-600 dark:text-white">
          Item not found!
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-light dark:bg-darkmode min-h-screen">
      {/* Title & Location Header */}
      <section className="bg-cover pt-16 pb-10 relative bg-gradient-to-b from-white from-10% dark:from-darkmode to-herobg to-90% dark:to-darklight overflow-x-hidden">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 text-center">
          <div className="flex justify-center gap-2 mb-3">
            <span className="text-sm font-bold bg-primary text-white py-1 px-3 rounded-md uppercase tracking-wider inline-block">
              {item.tag || item.status || 'For Sale'}
            </span>
            <span className="text-sm font-bold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white py-1 px-3 rounded-md uppercase tracking-wider inline-block">
              {item.country || 'N/A'}
            </span>
          </div>
          <h2 className="text-midnight_text text-3xl lg:text-[45px] leading-[1.2] font-bold dark:text-white mb-3">
            {item.property_title}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-300">
            📍 {item.location} | Category: <span className="font-semibold text-primary">{item.category}</span>
          </p>
        </div>
      </section>

      {/* Main Image & Album Gallery */}
      <section className="pb-10">
        <div className='container mx-auto px-4 max-w-5xl dark:bg-darkmode'>
          <div className="h-[400px] lg:h-[520px] w-full mb-4">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={item.property_title || 'Item Image'}
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

          {imagesList.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Item Album ({imagesList.length} Photos):</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {imagesList.map((imgUrl: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === imgUrl ? 'border-primary scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      width={150}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* JSON Fields Info Bar (Price, Sqft, Beds, Baths, Garages) */}
      <section className="pb-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="bg-white dark:bg-darklight shadow-property rounded-xl p-6 sm:p-8 border border-border dark:border-dark_border grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
            
            {/* Price */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {item.currency || 'AED'} {Number(item.price || 0).toLocaleString()}
              </span>
            </div>

            {/* Square Feet */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Area</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-1">
                📐 {item.sqrft} sqft
              </span>
            </div>

            {/* Beds */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Beds</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-1">
                🛏️ {item.beds}
              </span>
            </div>

            {/* Baths */}
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-dark_border last:border-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Baths</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-1">
                🛁 {item.baths}
              </span>
            </div>

            {/* Garages */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Garages</span>
              <span className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white flex items-center gap-1">
                🚗 {item.garages}
              </span>
            </div>

          </div>
        </div>
      </section>

      <TextSection />
      <CompanyInfo />
      <Tabbar />
    </div>
  );
}