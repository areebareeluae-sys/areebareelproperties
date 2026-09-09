'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Icon } from "@iconify/react";
import Image from 'next/image';
import HeroSub from '../../shared/hero-sub';
import { PropertyContext } from '@/context-api/PropertyContext';
import PropertyCard from '../../home/property-list/property-card';
import { Filters } from '@/app/types/property/filtertypes';

interface SearchOption {
    value: string;
    label: string;
}

interface SearchData {
    keywords?: { placeholder: string }[];
    locations?: SearchOption[];
    [key: string]: any;
}

export default function AdvanceSearch({ category }: { category?: string }) {
    const [price, setPrice] = useState(50);
    const [price1, setPrice1] = useState(50);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('AdvanceSearch must be used within a PropertyContextProvider');
    }
    const { properties, updateFilter, filters, fetchProperties, setProperties } = context as any;

    const [sortOrder, setSortOrder] = useState("none");
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
    const [searchData, setSearchData] = useState<SearchData>({});

    // Saari properties bina user filter ke fetch karne ka function
    const loadAllProperties = async () => {
        try {
            // Yahan koi userId pass nahi ki ja rahi, taake saara data aaye
            const res = await fetch(`/api/properties`);
            const result = await res.json();
            
            const propertyList = Array.isArray(result) ? result : result.data;
            if (propertyList && typeof setProperties === 'function') {
                setProperties(propertyList);
            } else if (typeof fetchProperties === 'function') {
                fetchProperties();
            }
        } catch (error) {
            console.error("Error loading properties:", error);
        }
    };

    // 1. Sync URL category parameter with context filters & load data
    useEffect(() => {
        if (category) {
            updateFilter('category' as keyof Filters, category);
        }
        loadAllProperties();
    }, [category]);

    // Fetch page search options
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/pagedata');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();
                setSearchData(data?.searchOptions || {});
            } catch (error) {
                console.error('Error fetching search options:', error);
            }
        };

        fetchData();
    }, []);

    const breadcrumbLinks = [
        { href: "/", text: "Home" },
        { href: "/properties/properties-list", text: "Property List" },
    ];

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(event.target.value);
        setPrice(val);
        updateFilter('distance' as keyof Filters, String(val));
    };

    const handlePriceChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(event.target.value);
        setPrice1(val);
        updateFilter('minPrice' as keyof Filters, String(val));
    };

    const handleSelectChange = (key: string, value: string) => {
        updateFilter(key as keyof Filters, value);
    };

    const toggleOffCanvas = () => {
        setIsOffCanvasOpen((prev) => !prev);
    };

    // Memoize sorted properties for performance optimization
    const sortedProperties = useMemo(() => {
        const propArray = Array.isArray(properties) ? properties : [];
        return [...propArray].sort((a, b) => {
            const titleA = a.property_title?.toLowerCase() || "";
            const titleB = b.property_title?.toLowerCase() || "";

            if (sortOrder === "asc") {
                return titleA.localeCompare(titleB);
            } else if (sortOrder === "desc") {
                return titleB.localeCompare(titleA);
            }
            return 0;
        });
    }, [properties, sortOrder]);

    const filteredCount = sortedProperties.length;

    return (
        <>
            <HeroSub
                title={filters?.category || "Properties List"}
                description="Letraset sheets containing Lorem Ipsum passages and more recently with desktop publishing Variou"
                breadcrumbLinks={breadcrumbLinks}
            />
            <section className='dark:bg-darkmode px-4 py-8'>
                <div className='lg:max-w-screen-xl max-w-screen-md mx-auto'>
                    
                    {/* Mobile Top Controls Bar */}
                    <div className='flex lg:hidden justify-between items-center mb-6 px-2'>
                        <span className='text-2xl font-semibold'>Advance Filter</span>
                        <div className='flex items-center gap-2'>
                            <button onClick={toggleOffCanvas} className='bg-blue-500 text-white p-2.5 rounded-lg' aria-label="Toggle Filter">
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6' viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" d="M21.25 12H8.895m-4.361 0H2.75m18.5 6.607h-5.748m-4.361 0H2.75m18.5-13.214h-3.105m-4.361 0H2.75m13.214 2.18a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm-9.25 6.607a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm6.607 6.608a2.18 2.18 0 1 0 0-4.361a2.18 2.18 0 0 0 0 4.36Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Off-Canvas Drawer */}
                    <div className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${isOffCanvasOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
                        <div 
                            onClick={toggleOffCanvas} 
                            className={`absolute inset-0 bg-gray-900 transition-opacity duration-300 ${isOffCanvasOpen ? 'opacity-50' : 'opacity-0'}`} 
                        />
                        <div className={`absolute top-0 right-0 w-3/4 max-w-xs bg-white dark:bg-semidark shadow-lg h-full overflow-y-auto transition-transform duration-300 transform ${isOffCanvasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className='py-14 px-8 relative'>
                                <button onClick={toggleOffCanvas} className='absolute top-4 right-4 text-gray dark:text-gray-500 text-xl font-bold'>
                                    ✕
                                </button>
                                <p className='mb-6 text-2xl font-semibold'>Advanced Search</p>
                                <div className='flex flex-col gap-6'>
                                    {searchData?.keywords?.map((option, index) => (
                                        <div key={`keyword-m-${index}`} className="relative inline-block">
                                            <input
                                                placeholder={option.placeholder}
                                                type='text'
                                                value={filters?.keyword || ''}
                                                className='py-3 w-full pl-3 pr-9 border border-border dark:bg-semidark dark:border-dark_border dark:focus:border-primary !rounded-lg focus-visible:outline-none focus:border-primary'
                                                onChange={(e) => updateFilter('keyword' as keyof Filters, e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <div className="relative inline-block">
                                        <select
                                            value={filters?.location || ''}
                                            className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 mr-2 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                            onChange={(e) => updateFilter('location' as keyof Filters, e.target.value)}
                                        >
                                            {searchData?.locations?.map((option, index) => (
                                                <option key={`location-m-${index}`} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <p className='text-gray dark:text-gray font-medium'>
                                            Distance: {price} miles
                                        </p>
                                        <input
                                            type="range"
                                            min="50"
                                            max="750"
                                            value={price}
                                            onChange={handlePriceChange}
                                            className="w-full h-0.5 bg-lightborder dark:bg-dark_border mt-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {Object.entries(searchData).map(([key, options]) => (
                                        key !== 'keywords' && key !== 'locations' && (
                                            <div key={`m-${key}`} className="relative inline-block">
                                                <select
                                                    value={(filters as any)[key] || ''}
                                                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 mr-2 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                                    onChange={(e) => handleSelectChange(key, e.target.value)}
                                                >
                                                    {(options as SearchOption[])?.map((option, index) => (
                                                        <option key={`${key}-m-${index}`} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )
                                    ))}

                                    <div>
                                        <p className='text-gray dark:text-gray font-medium'>
                                            From ${price1} to $8000
                                        </p>
                                        <input
                                            type="range"
                                            min="50"
                                            max="8000"
                                            value={price1}
                                            onChange={handlePriceChange1}
                                            className="w-full h-0.5 bg-lightborder dark:bg-dark_border mt-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <button 
                                            onClick={toggleOffCanvas} 
                                            className='bg-blue-500 hover:bg-blue-600 text-white w-full py-3 px-6 text-base rounded-lg transition-colors'
                                        >
                                            Find Property
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='lg:grid lg:grid-cols-12 gap-6'>
                        {/* Desktop Search Sidebar */}
                        <div className='hidden lg:block lg:col-span-4'>
                            <div className='py-14 px-8 bg-white dark:bg-semidark shadow-property rounded-lg'>
                                <p className='mb-6 text-2xl font-semibold'>Advanced Search</p>
                                <div className='flex flex-col gap-6'>
                                    {searchData?.keywords?.map((option, index) => (
                                        <div key={`keyword-d-${index}`} className="relative inline-block">
                                            <input
                                                placeholder={option.placeholder}
                                                type='text'
                                                value={filters?.keyword || ''}
                                                className='py-3 w-full pl-3 pr-9 border border-border dark:bg-semidark dark:border-dark_border dark:focus:border-primary !rounded-lg focus-visible:outline-none focus:border-primary'
                                                onChange={(e) => updateFilter('keyword' as keyof Filters, e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <div className="relative inline-block">
                                        <select
                                            value={filters?.location || ''}
                                            className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 mr-2 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                            onChange={(e) => updateFilter('location' as keyof Filters, e.target.value)}
                                        >
                                            {searchData?.locations?.map((option, index) => (
                                                <option key={`location-d-${index}`} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {Object.entries(searchData).map(([key, options]) => (
                                        key !== 'keywords' && key !== 'locations' && (
                                            <div key={`d-${key}`} className="relative inline-block">
                                                <select
                                                    value={(filters as any)[key] || ''}
                                                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 mr-2 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                                    onChange={(e) => handleSelectChange(key, e.target.value)}
                                                >
                                                    {(options as SearchOption[])?.map((option, index) => (
                                                        <option key={`${key}-d-${index}`} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )
                                    ))}

                                    <div>
                                        <button className='bg-primary hover:bg-blue-700 text-white w-full py-3 px-6 text-base rounded-lg transition-colors'>
                                            Find Property
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Listings View */}
                        <div className='col-span-12 lg:col-span-8'>
                            {/* Desktop Header Controls Bar */}
                            <div className="flex lg:flex-nowrap flex-wrap lg:gap-0 gap-6 w-full justify-between items-center pb-8 px-4">
                                <h5 className='text-xl font-semibold'>{filteredCount} Properties Found</h5>

                                <div className="flex items-center gap-3">

                                    <select
                                        name="sort"
                                        className="custom-select border border-border dark:border-dark_border dark:bg-darkmode text-midnight_text focus:border-primary rounded-lg p-2.5 pr-8"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                    >
                                        <option value="none">Sort by Title</option>
                                        <option value="asc">Title (A-Z)</option>
                                        <option value="desc">Title (Z-A)</option>
                                    </select>

                                    <button 
                                        onClick={() => setViewMode('list')} 
                                        className={`${viewMode === "list" ? 'bg-primary text-white' : 'bg-transparent text-primary'} p-2.5 border border-primary hover:text-white rounded-lg hover:bg-primary text-base transition-colors`}
                                        aria-label="List View"
                                    >
                                        <Icon icon="famicons:list" width="20" height="20" />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        className={`${viewMode === "grid" ? 'bg-primary text-white' : 'bg-transparent text-primary'} p-2.5 border border-primary hover:text-white rounded-lg hover:bg-primary text-base transition-colors`}
                                        aria-label="Grid View"
                                    >
                                        <Icon icon="ion:grid-sharp" width="20" height="20" />
                                    </button>
                                </div>
                            </div>

                            {/* Property Listings */}
                            {sortedProperties.length > 0 ? (
                                <div className={`${viewMode === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col'} gap-6 px-4`}>
                                    {sortedProperties.map((data: any, index: number) => (
                                        <PropertyCard key={data.id || index} property={data} viewMode={viewMode} />
                                    ))}
                                </div>
                            ) : (
                                <div className='flex flex-col gap-5 items-center justify-center pt-20'>
                                    <Image src="/images/not-found/no-results.png" alt='no-result' width={100} height={100} />
                                    <p className='text-gray'>No result found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

          
           
        </>
    );
}