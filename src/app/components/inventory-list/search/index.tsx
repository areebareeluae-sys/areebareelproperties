'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Icon } from "@iconify/react";
import Image from 'next/image';
import HeroSub from '../../shared/hero-sub';
import { InventoryContext } from '@/context-api/inventoryContext'; 
import PropertyCard from '../../home/inventory/inventory-card';
import { Filters } from '@/app/types/inventory/filtertypes';

interface SearchOption {
    value: string;
    label: string;
    placeholder?: string;
}

interface SearchData {
    keywords?: SearchOption[];
    country?: SearchOption[];
    [key: string]: SearchOption[] | undefined;
}

export default function AdvanceSearch({ category }: { category?: string }) {
    const [distance, setDistance] = useState(50);
    const [minPrice, setMinPrice] = useState(50);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('AdvanceSearch must be used within an InventoryContextProvider');
    }
    const { inventoryList, updateFilter, filters, fetchInventory, setInventoryList } = context as any;

    const [sortOrder, setSortOrder] = useState("none");
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
    const [searchData, setSearchData] = useState<SearchData>({});
    
    // State for the initial country selection popup
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [selectedPopupCountry, setSelectedPopupCountry] = useState('');

    const loadAllInventory = async () => {
        try {
            const res = await fetch(`/api/inventorydata`);
            const result = await res.json();
           
            const dataList = Array.isArray(result) ? result : result.data;
            if (dataList && Array.isArray(dataList)) {
                if (typeof setInventoryList === 'function') {
                    setInventoryList(dataList);
                }
            } else if (typeof fetchInventory === 'function') {
                fetchInventory();
            }
        } catch (error) {
            console.error("Error loading Inventory:", error);
        }
    };

    useEffect(() => {
        if (category) {
            updateFilter('category' as keyof Filters, category);
        }
        loadAllInventory();
    }, [category]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/pagedata');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();
                const options = data?.searchOptions || {};
                setSearchData(options);

                // Show popup on load if country filter isn't already set
                if (!filters?.country) {
                    setIsCountryModalOpen(true);
                }
            } catch (error) {
                console.error('Error fetching search options:', error);
            }
        };

        fetchData();
    }, []);

    const handlePopupCountrySubmit = (countryValue: string) => {
        if (countryValue) {
            setSelectedPopupCountry(countryValue);
            updateFilter('country' as keyof Filters, countryValue);
        }
        setIsCountryModalOpen(false);
    };

    // Function to Reset All Filters
    const handleResetFilters = () => {
        setSelectedPopupCountry('');
        setSortOrder('none');
        setDistance(50);
        setMinPrice(50);
        
        // Clear all active filters if updateFilter supports clearing or passing empty values
        if (filters) {
            Object.keys(filters).forEach((key) => {
                updateFilter(key as keyof Filters, '');
            });
        }
        loadAllInventory();
    };

    const breadcrumbLinks = [
        { href: "/", text: "Home" },
        { href: "/properties/properties-list", text: "Inventory List" },
    ];

    const handleDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(event.target.value);
        setDistance(val);
        updateFilter('distance' as keyof Filters, String(val));
    };

    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(event.target.value);
        setMinPrice(val);
        updateFilter('minPrice' as keyof Filters, String(val));
    };

    const handleSelectChange = (key: string, value: string) => {
        updateFilter(key as keyof Filters, value);
    };

    const toggleOffCanvas = () => {
        setIsOffCanvasOpen((prev) => !prev);
    };

    const sortedInventory = useMemo(() => {
        let invArray = Array.isArray(inventoryList) ? [...inventoryList] : [];

        if (filters) {
            if (filters.category) {
                invArray = invArray.filter((item: any) =>
                    item.category?.toLowerCase() === filters.category.toLowerCase()
                );
            }
            if (filters.country) {
                invArray = invArray.filter((item: any) =>
                    item.country?.toLowerCase() === filters.country.toLowerCase() ||
                    item.location?.toLowerCase().includes(filters.country.toLowerCase())
                );
            }
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                invArray = invArray.filter((item: any) =>
                    item.property_title?.toLowerCase().includes(kw) ||
                    item.location?.toLowerCase().includes(kw) ||
                    item.country?.toLowerCase().includes(kw)
                );
            }
        }

        return invArray.sort((a, b) => {
            const titleA = a.property_title?.toLowerCase() || "";
            const titleB = b.property_title?.toLowerCase() || "";

            if (sortOrder === "asc") {
                return titleA.localeCompare(titleB);
            } else if (sortOrder === "desc") {
                return titleB.localeCompare(titleA);
            }
            return 0;
        });
    }, [inventoryList, filters, sortOrder]);

    const filteredCount = sortedInventory.length;

    const CountryDropdown = () => (
        <div className="relative inline-block w-full">
            <select
                value={filters?.country || ''}
                className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                onChange={(e) => updateFilter('country' as keyof Filters, e.target.value)}
            >
                <option value="">Select Country</option>
                {searchData?.country?.map((countryItem, index) => (
                    <option key={`country-${index}`} value={countryItem.value}>
                        {countryItem.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <>
            {/* Initial Country Selection Popup with Background Blur */}
            {isCountryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
                    <div className="bg-white dark:bg-semidark rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
                        <h3 className="text-2xl font-semibold mb-2 text-black dark:text-white">Select Your Country</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Please choose a country below to filter the inventory view according to your preference.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto pr-1">
                            {searchData?.country?.map((countryItem, index) => (
                                <button
                                    key={`popup-country-${index}`}
                                    type="button"
                                    onClick={() => handlePopupCountrySubmit(countryItem.value)}
                                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border transition-all ${
                                        selectedPopupCountry === countryItem.value
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-gray-50 dark:bg-darkmode text-gray-700 dark:text-gray-300 border-border dark:border-dark_border hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {countryItem.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <HeroSub
                title={filters?.category || "Inventory List"}
                description=""
                breadcrumbLinks={breadcrumbLinks}
            />
            <section className='dark:bg-darkmode px-4 py-8'>
                <div className='lg:max-w-screen-xl max-w-screen-md mx-auto'>
                    
                    <div className='flex lg:hidden justify-between items-center mb-6 px-2'>
                        <span className='text-2xl font-semibold'>Advance Filter</span>
                        <div className='flex items-center gap-2'>
                            <button onClick={toggleOffCanvas} className='bg-primary text-white p-2.5 rounded-lg' aria-label="Toggle Filter">
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6' viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" d="M21.25 12H8.895m-4.361 0H2.75m18.5 6.607h-5.748m-4.361 0H2.75m18.5-13.214h-3.105m-4.361 0H2.75m13.214 2.18a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm-9.25 6.607a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm6.607 6.608a2.18 2.18 0 1 0 0-4.361a2.18 2.18 0 0 0 0 4.36Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${isOffCanvasOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
                        <div
                            onClick={toggleOffCanvas}
                            className={`absolute inset-0 bg-gray-900 transition-opacity duration-300 ${isOffCanvasOpen ? 'opacity-50' : 'opacity-0'}`}
                        />
                        <div className={`absolute top-0 right-0 w-3/4 max-w-xs bg-white dark:bg-semidark shadow-lg h-full overflow-y-auto transition-transform duration-300 transform ${isOffCanvasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className='py-14 px-6 relative'>
                                <button onClick={toggleOffCanvas} className='absolute top-4 right-4 text-gray dark:text-gray-500 text-xl font-bold'>
                                    ✕
                                </button>
                                <p className='mb-6 text-2xl font-semibold'>Advanced Search</p>
                                <div className='flex flex-col gap-6'>
                                    {searchData?.keywords?.map((option, index) => (
                                        <div key={`keyword-m-${index}`} className="relative w-full">
                                            <input
                                                placeholder={option.placeholder || 'Keyword'}
                                                type='text'
                                                value={filters?.keyword || ''}
                                                className='py-3 w-full pl-3 pr-9 border border-border dark:bg-semidark dark:border-dark_border dark:focus:border-primary !rounded-lg focus-visible:outline-none focus:border-primary'
                                                onChange={(e) => updateFilter('keyword' as keyof Filters, e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <CountryDropdown />

                                    <div>
                                        <p className='text-gray dark:text-gray font-medium'>
                                            Distance: {distance} miles
                                        </p>
                                        <input
                                            type="range"
                                            min="50"
                                            max="750"
                                            value={distance}
                                            onChange={handleDistanceChange}
                                            className="w-full h-1 bg-lightborder dark:bg-dark_border mt-2 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>

                                    {Object.entries(searchData).map(([key, options]) => (
                                        key !== 'keywords' && key !== 'country' && Array.isArray(options) && (
                                            <div key={`m-${key}`} className="relative w-full">
                                                <select
                                                    value={(filters as any)[key] || ''}
                                                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                                    onChange={(e) => handleSelectChange(key, e.target.value)}
                                                >
                                                    {options.map((option, index) => (
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
                                            From ${minPrice} to $8000
                                        </p>
                                        <input
                                            type="range"
                                            min="50"
                                            max="8000"
                                            value={minPrice}
                                            onChange={handleMinPriceChange}
                                            className="w-full h-1 bg-lightborder dark:bg-dark_border mt-2 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={toggleOffCanvas}
                                            className='bg-primary hover:bg-blue-600 text-white w-full py-3 px-6 text-base rounded-lg transition-colors'
                                        >
                                            Find Inventory
                                        </button>
                                        <button
                                            onClick={handleResetFilters}
                                            className='bg-gray-200 dark:bg-darkmode hover:bg-gray-300 text-gray-800 dark:text-white w-full py-3 px-6 text-base rounded-lg transition-colors flex items-center justify-center gap-2'
                                        >
                                            <Icon icon="lucide:rotate-ccw" width="18" height="18" />
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='lg:grid lg:grid-cols-12 gap-6'>
                        <div className='hidden lg:block lg:col-span-4'>
                            <div className='py-8 px-6 bg-white dark:bg-semidark shadow-property rounded-lg'>
                                <div className="flex justify-between items-center mb-6">
                                    <p className='text-2xl font-semibold'>Advanced Search</p>
                                    <button 
                                        onClick={handleResetFilters} 
                                        title="Reset All Filters"
                                        className="text-primary hover:text-blue-700 p-2 rounded-lg bg-primary/10 transition-colors flex items-center gap-1.5 text-sm font-medium"
                                    >
                                        <Icon icon="lucide:rotate-ccw" width="16" height="16" />
                                        Reset
                                    </button>
                                </div>
                                <div className='flex flex-col gap-6'>
                                    {searchData?.keywords?.map((option, index) => (
                                        <div key={`keyword-d-${index}`} className="relative w-full">
                                            <input
                                                placeholder={option.placeholder || 'Keyword'}
                                                type='text'
                                                value={filters?.keyword || ''}
                                                className='py-3 w-full pl-3 pr-9 border border-border dark:bg-semidark dark:border-dark_border dark:focus:border-primary !rounded-lg focus-visible:outline-none focus:border-primary'
                                                onChange={(e) => updateFilter('keyword' as keyof Filters, e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <CountryDropdown />

                                    {Object.entries(searchData).map(([key, options]) => (
                                        key !== 'keywords' && key !== 'country' && Array.isArray(options) && (
                                            <div key={`d-${key}`} className="relative w-full">
                                                <select
                                                    value={(filters as any)[key] || ''}
                                                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                                                    onChange={(e) => handleSelectChange(key, e.target.value)}
                                                >
                                                    {options.map((option, index) => (
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
                                            Find Inventory
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='col-span-12 lg:col-span-8'>
                            <div className="flex lg:flex-nowrap flex-wrap lg:gap-0 gap-6 w-full justify-between items-center pb-8 px-2">
                                <h5 className='text-xl font-semibold'>{filteredCount} Inventory Found</h5>

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

                            {sortedInventory.length > 0 ? (
                                <div className={`${viewMode === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col'} gap-6 px-2`}>
                                    {sortedInventory.map((data: any, index: number) => (
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