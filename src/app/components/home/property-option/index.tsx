'use client';
import { PropertyContext } from '@/context-api/PropertyContext';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';

export default function DiscoverProperties() {
    const { properties, updateFilter } = useContext(PropertyContext)!;
    const [propertiesData, setPropertiesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/propertydata');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();
                const categoryMap: Record<string, { category: string, category_img: string, count: number }> = {};

                data.forEach((item: any) => {
                    if (categoryMap[item.category]) {
                        categoryMap[item.category].count += 1;
                    } else {
                        categoryMap[item.category] = {
                            category: item.category,
                            category_img: item.image || "/images/properties/default.jpg",
                            count: 1,
                        };
                    }
                });

                const uniqueCategoryData = Object.values(categoryMap);
                setPropertiesData(uniqueCategoryData);

            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <section className='dark:bg-darkmode py-12'>
            <div className="container lg:max-w-screen-xl md:max-w-screen-md mx-auto px-4">
                <h2 className="text-4xl font-bold mb-10 text-midnight_text dark:text-white" data-aos="fade-left">Discover Properties</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-4 gap-6">
                    {propertiesData.map((property, index) => (
                        <div 
                            key={index} 
                            className="image-item block flex flex-col h-full cursor-pointer" 
                            onClick={() => updateFilter('category', property.category)} 
                            data-aos="fade-up" 
                            data-aos-delay={`${index * 100}`}
                        >
                            <Link href={`/properties/properties-list`} className='group flex flex-col h-full items-center text-center'>
                                {/* Smaller Square Container for Image */}
                                <div className='relative w-full h-[80px] sm:h-[85px] p-1.5 border-2 rounded-xl border-border dark:border-dark_border mb-3 overflow-hidden bg-gray-50 dark:bg-darklight group-hover:-translate-y-1 transition-transform duration-300'>
                                    <Image
                                        src={property.category_img}
                                        alt={property.category}
                                        fill
                                        className='object-cover rounded-lg'
                                    />
                                </div>
                                
                                {/* Centered & Smaller Text */}
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