'use client';
import { PropertyContext } from '@/context-api/PropertyContext';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import React from 'react';

export default function DiscoverProperties() {
    const context = useContext(PropertyContext);
    if (!context) return null;
    
    const { properties, filters, updateFilter } = context;
    const [propertiesData, setPropertiesData] = useState<any[]>([]);

    useEffect(() => {
        if (properties && properties.length > 0) {
            // Selected country ke mutabiq properties filter karna (strict match with trim & lowercase)
            const filteredByCountry = properties.filter((item: any) => {
                if (filters?.country && filters.country.trim() !== '') {
                    if (!item.country) return false;
                    return item.country.toLowerCase().trim() === filters.country.toLowerCase().trim();
                }
                return true; // Agar koi country select nahi hai toh sab show hongi
            });

            const categoryMap: Record<string, { category: string, category_img: string, count: number }> = {};

            filteredByCountry.forEach((item: any) => {
                const cat = item.category || 'Uncategorized';
                if (categoryMap[cat]) {
                    categoryMap[cat].count += 1;
                } else {
                    categoryMap[cat] = {
                        category: cat,
                        category_img: item.image || "/images/properties/default.jpg",
                        count: 1,
                    };
                }
            });

            const uniqueCategoryData = Object.values(categoryMap);
            setPropertiesData(uniqueCategoryData);
        } else {
            setPropertiesData([]);
        }
    }, [properties, filters?.country]);

    return (
        <section className='dark:bg-darkmode py-12'>
            <div className="container lg:max-w-screen-xl md:max-w-screen-md mx-auto px-4">
                <h2 className="text-4xl font-bold mb-10 text-midnight_text dark:text-white" data-aos="fade-left">Discover Properties</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-4 gap-6">
                    {propertiesData.map((property: any, index: number) => (
                        <div 
                            key={index} 
                            className="image-item block flex flex-col h-full cursor-pointer" 
                            onClick={() => updateFilter('category', property.category)} 
                            data-aos="fade-up" 
                            data-aos-delay={`${index * 100}`}
                        >
                            <Link 
                                href={`/properties/properties-list?category=${encodeURIComponent(property.category)}`} 
                                className='group flex flex-col h-full items-center text-center'
                            >
                                <div className='relative w-full h-[80px] sm:h-[85px] p-1.5 border-2 rounded-xl border-border dark:border-dark_border mb-3 overflow-hidden bg-gray-50 dark:bg-darklight group-hover:-translate-y-1 transition-transform duration-300'>
                                    <Image
                                        src={property.category_img}
                                        alt={property.category}
                                        fill
                                        className='object-cover rounded-lg'
                                    />
                                </div>
                                <div className="flex flex-col flex-1 justify-between w-full">
                                    <p className="text-sm font-semibold text-midnight_text dark:text-white group-hover:text-primary transition-colors capitalize mb-0.5 line-clamp-2">
                                        {property.category}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {property.count} Properties
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}