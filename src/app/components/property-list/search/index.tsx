'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from "@iconify/react";
import Image from 'next/image';
import HeroSub from '../../shared/hero-sub';
import { PropertyContext } from '@/context-api/PropertyContext';
import PropertyCard from '../../home/property-list/property-card';
import { Filters } from '@/app/types/property/filtertypes';

interface SearchOption {
    value: string;
    label: string;
    country?: string;
    city?: string;
    property_type?: string;
    type?: string;
    placeholder?: string;
}

interface SearchData {
    keywords?: SearchOption[];
    country?: SearchOption[];
    property_type?: SearchOption[];
    city?: SearchOption[];
    area?: SearchOption[];
    status?: SearchOption[];
    category?: SearchOption[];
    tag?: SearchOption[];
    beds?: SearchOption[];
    baths?: SearchOption[];
    garages?: SearchOption[];
    [key: string]: SearchOption[] | undefined;
}

export default function AdvanceSearch({ category }: { category?: string }) {
    const searchParams = useSearchParams();
    const urlStatus = searchParams.get('status'); 
    const urlListingType = searchParams.get('listing_type');

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
   
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('AdvanceSearch must be used within a PropertyContextProvider');
    }
    const { properties, updateFilter, filters, fetchProperties, setProperties } = context as any;

    const [sortOrder, setSortOrder] = useState("none");
    const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
    const [searchData, setSearchData] = useState<SearchData>({});

    const toggleOffCanvas = () => {
        setIsOffCanvasOpen(!isOffCanvasOpen);
    };

    const loadAllProperties = async () => {
        try {
            const res = await fetch(`/api/propertydata`);
            const result = await res.json();
           
            const propertyList = Array.isArray(result) ? result : result.data;
            if (propertyList && Array.isArray(propertyList)) {
                if (typeof setProperties === 'function') {
                    setProperties(propertyList);
                }
            } else if (typeof fetchProperties === 'function') {
                fetchProperties();
            }
        } catch (error) {
            console.error("Error loading properties:", error);
        }
    };

    // Updated useEffect to reset and sync filters properly when URL parameters or category change
    useEffect(() => {
        const storedCountry = localStorage.getItem('selected_country') || localStorage.getItem('selectedCountry') || sessionStorage.getItem('selected_country');
        
        if (storedCountry) {
            let countryValue = storedCountry;
            if (storedCountry.toUpperCase() === 'PK') {
                countryValue = 'Pakistan';
            } else if (storedCountry.toUpperCase() === 'UAE') {
                countryValue = 'United Arab Emirates';
            }
            updateFilter('country' as keyof Filters, countryValue);
        } else {
            updateFilter('country' as keyof Filters, '');
        }

        if (category) {
            updateFilter('category' as keyof Filters, category);
        } else {
            updateFilter('category' as keyof Filters, '');
        }

        if (urlStatus) {
            updateFilter('status' as keyof Filters, urlStatus);
        } else {
            updateFilter('status' as keyof Filters, '');
        }

        if (urlListingType) {
            updateFilter('listing_type' as keyof Filters, urlListingType);
            updateFilter('purpose' as keyof Filters, urlListingType);
        } else {
            updateFilter('listing_type' as keyof Filters, '');
            updateFilter('purpose' as keyof Filters, '');
        }

        loadAllProperties();
    }, [category, urlStatus, urlListingType]);

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

    const handleCountryChange = (countryValue: string) => {
        updateFilter('country' as keyof Filters, countryValue);
        if (!countryValue) {
            updateFilter('city' as keyof Filters, '');
            updateFilter('area' as keyof Filters, '');
        } else {
            if (filters?.city && searchData?.city) {
                const cityObj = searchData.city.find(c => c.value.toLowerCase() === filters.city.toLowerCase());
                if (cityObj && cityObj.country && cityObj.country.toLowerCase() !== countryValue.toLowerCase()) {
                    updateFilter('city' as keyof Filters, '');
                    updateFilter('area' as keyof Filters, '');
                }
            }
        }
    };

    const handleCityChange = (cityValue: string) => {
        updateFilter('city' as keyof Filters, cityValue);
        
        if (!cityValue) {
            updateFilter('area' as keyof Filters, '');
        } else {
            if (filters?.area && searchData?.area) {
                const areaObj = searchData.area.find(a => a.value.toLowerCase() === filters.area.toLowerCase());
                if (areaObj && areaObj.city && areaObj.city.toLowerCase() !== cityValue.toLowerCase()) {
                    updateFilter('area' as keyof Filters, '');
                }
            }

            const selectedCityObj = searchData?.city?.find(c => c.value.toLowerCase() === cityValue.toLowerCase());
            if (selectedCityObj && selectedCityObj.country) {
                updateFilter('country' as keyof Filters, selectedCityObj.country);
            }
        }
    };

    const handleAreaChange = (areaValue: string) => {
        updateFilter('area' as keyof Filters, areaValue);

        if (areaValue && searchData?.area) {
            const selectedAreaObj = searchData.area.find(a => a.value.toLowerCase() === areaValue.toLowerCase());
            if (selectedAreaObj?.city) {
                updateFilter('city' as keyof Filters, selectedAreaObj.city);

                const parentCityObj = searchData?.city?.find(c => c.value.toLowerCase() === selectedAreaObj.city?.toLowerCase());
                if (parentCityObj && parentCityObj.country) {
                    updateFilter('country' as keyof Filters, parentCityObj.country);
                }
            }
        }
    };

    const handleListingTypeChange = (listingValue: string) => {
        updateFilter('listing_type' as keyof Filters, listingValue);
        updateFilter('purpose' as keyof Filters, listingValue);

        if (filters?.category && searchData?.category) {
            const catObj = searchData.category.find(c => c.value.toLowerCase() === filters.category.toLowerCase());
            const catType = catObj?.type || catObj?.property_type;
            if (listingValue && catType && catType.toLowerCase() !== listingValue.toLowerCase()) {
                updateFilter('category' as keyof Filters, '');
            }
        }
    };

    const filteredCities = useMemo(() => {
        if (!searchData?.city) return [];
        let cities = searchData.city;

        if (filters?.area && searchData?.area) {
            const selectedAreaObj = searchData.area.find(a => a.value.toLowerCase() === filters.area.toLowerCase());
            if (selectedAreaObj && selectedAreaObj.city) {
                cities = cities.filter(c => c.value.toLowerCase() === selectedAreaObj.city?.toLowerCase() || c.value === '');
            }
        } else if (filters?.country) {
            cities = cities.filter((cityItem: any) => {
                const matchesProp = properties.some((p: any) => 
                    p.country?.toLowerCase() === filters.country.toLowerCase() && 
                    p.city?.toLowerCase() === cityItem.value.toLowerCase()
                );
                return cityItem.country?.toLowerCase() === filters.country.toLowerCase() || matchesProp || !cityItem.country;
            });
        }

        return cities;
    }, [searchData?.city, searchData?.area, filters?.country, filters?.area, properties]);

    const filteredAreas = useMemo(() => {
        if (!searchData?.area) return [];
        
        if (filters?.city) {
            return searchData.area.filter((areaItem: any) => {
                return areaItem.city?.toLowerCase() === filters.city.toLowerCase() || !areaItem.city;
            });
        }
        
        if (filters?.country && searchData?.city) {
            const validCities = searchData.city
                .filter(c => c.country?.toLowerCase() === filters.country.toLowerCase())
                .map(c => c.value.toLowerCase());

            return searchData.area.filter((areaItem: any) => {
                return (areaItem.city && validCities.includes(areaItem.city.toLowerCase())) || !areaItem.city;
            });
        }

        return searchData.area;
    }, [searchData?.area, searchData?.city, filters?.city, filters?.country]);

    const filteredCategories = useMemo(() => {
        if (!searchData?.category) return [];
        const currentListingType = filters?.listing_type || filters?.purpose;
        if (!currentListingType) return searchData.category;

        return searchData.category.filter((catItem: any) => {
            const itemType = catItem.type || catItem.property_type;
            return itemType?.toLowerCase() === currentListingType.toLowerCase() || !itemType;
        });
    }, [searchData?.category, filters?.listing_type, filters?.purpose]);

    const activeListingType = filters?.listing_type || filters?.purpose;
    const isCommercial = activeListingType?.toLowerCase() === 'commercial';

    const sortedProperties = useMemo(() => {
        let propArray = Array.isArray(properties) ? [...properties] : [];

        if (filters) {
            if (filters.category) {
                propArray = propArray.filter((item: any) =>
                    item.category?.toLowerCase() === filters.category.toLowerCase()
                );
            }

            if (filters.country) {
                propArray = propArray.filter((item: any) =>
                    item.country?.toLowerCase() === filters.country.toLowerCase() ||
                    item.location?.toLowerCase().includes(filters.country.toLowerCase())
                );
            }

            if (filters.city) {
                propArray = propArray.filter((item: any) =>
                    item.city?.toLowerCase() === filters.city.toLowerCase() ||
                    item.location?.toLowerCase().includes(filters.city.toLowerCase())
                );
            }

            if (filters.area) {
                propArray = propArray.filter((item: any) =>
                    item.area?.toLowerCase() === filters.area.toLowerCase() ||
                    item.location?.toLowerCase().includes(filters.area.toLowerCase())
                );
            }

            if (filters.status && filters.status !== "") {
                const filterStatus = filters.status.trim().toLowerCase();
                propArray = propArray.filter((item: any) => {
                    const itemTag = (item.tag || '').trim().toLowerCase();
                    const itemStatus = (item.status || '').trim().toLowerCase();
                    const itemTitle = (item.property_title || '').trim().toLowerCase();
                    const itemPropType = (item.property_type || '').trim().toLowerCase();

                    return (
                        itemTag === filterStatus || 
                        itemStatus === filterStatus || 
                        itemPropType === filterStatus || 
                        itemTitle.includes(filterStatus)
                    );
                });
            }

            if (activeListingType) {
                propArray = propArray.filter((item: any) =>
                    item.listing_type?.toLowerCase() === activeListingType.toLowerCase() ||
                    item.purpose?.toLowerCase() === activeListingType.toLowerCase() ||
                    item.property_type?.toLowerCase() === activeListingType.toLowerCase()
                );
            }

            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                propArray = propArray.filter((item: any) =>
                    item.property_title?.toLowerCase().includes(kw) ||
                    item.location?.toLowerCase().includes(kw) ||
                    item.country?.toLowerCase().includes(kw) ||
                    item.city?.toLowerCase().includes(kw)
                );
            }

            if (filters.tag) {
                const filterTag = filters.tag.trim().toLowerCase();
                propArray = propArray.filter((item: any) => {
                    if (typeof item.tag === 'string') {
                        return item.tag.trim().toLowerCase() === filterTag;
                    }
                    if (Array.isArray(item.tag)) {
                        return item.tag.map((t: string) => t.trim().toLowerCase()).includes(filterTag);
                    }
                    return false;
                });
            }

            if (!isCommercial) {
                if (filters.beds) {
                    propArray = propArray.filter((item: any) => Number(item.beds) === Number(filters.beds));
                }

                if (filters.baths) {
                    propArray = propArray.filter((item: any) => Number(item.baths) === Number(filters.baths));
                }

                if (filters.garages) {
                    propArray = propArray.filter((item: any) => Number(item.garages) === Number(filters.garages));
                }
            }

            if (filters.area_size) {
                propArray = propArray.filter((item: any) =>
                    String(item.area_size || '').toLowerCase().includes(filters.area_size.toLowerCase())
                );
            }

            if (filters.distance) {
                const maxDist = Number(filters.distance);
                propArray = propArray.filter((item: any) => {
                    const itemDist = Number(item.distance || 0);
                    return itemDist <= maxDist;
                });
            }
        }

        return propArray.sort((a, b) => {
            const titleA = a.property_title?.toLowerCase() || "";
            const titleB = b.property_title?.toLowerCase() || "";

            if (sortOrder === "asc") {
                return titleA.localeCompare(titleB);
            } else if (sortOrder === "desc") {
                return titleB.localeCompare(titleA);
            }
            return 0;
        });
    }, [properties, filters, sortOrder, isCommercial, activeListingType]);

    const filteredCount = sortedProperties.length;

    const FilterContent = () => (
        <div className='flex flex-col gap-6'>
            <div className="relative inline-block">
                <input
                    placeholder='Enter Keyword...'
                    type='text'
                    value={filters?.keyword || ''}
                    className='py-3 w-full pl-3 pr-9 border border-border dark:bg-semidark dark:border-dark_border dark:focus:border-primary !rounded-lg focus-visible:outline-none focus:border-primary'
                    onChange={(e) => updateFilter('keyword' as keyof Filters, e.target.value)}
                />
            </div>

            <div className="relative inline-block">
                <select
                    value={activeListingType || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => handleListingTypeChange(e.target.value)}
                >
                    <option value="">All Purposes (Residential/Commercial)</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.property_type || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => updateFilter('property_type' as keyof Filters, e.target.value)}
                >
                   
                    {searchData?.property_type?.map((pType, index) => (
                        <option key={`ptype-${index}`} value={pType.value}>
                            {pType.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.country || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => handleCountryChange(e.target.value)}
                >
                    
                    {searchData?.country?.map((cItem, index) => (
                        <option key={`country-${index}`} value={cItem.value}>
                            {cItem.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.city || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => handleCityChange(e.target.value)}
                >
                  
                    {filteredCities.map((cityItem, index) => (
                        <option key={`city-${index}`} value={cityItem.value}>
                            {cityItem.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.area || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => handleAreaChange(e.target.value)}
                >
                  
                    {filteredAreas.map((areaItem, index) => (
                        <option key={`area-${index}`} value={areaItem.value}>
                            {areaItem.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.category || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => updateFilter('category' as keyof Filters, e.target.value)}
                >
                   
                    {filteredCategories.map((catItem, index) => (
                        <option key={`cat-${index}`} value={catItem.value}>
                            {catItem.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative inline-block">
                <select
                    value={filters?.status || ''}
                    className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                    onChange={(e) => updateFilter('status' as keyof Filters, e.target.value)}
                >
                   
                    {searchData?.status?.map((statusItem, index) => (
                        <option key={`status-${index}`} value={statusItem.value}>
                            {statusItem.label}
                        </option>
                    ))}
                </select>
            </div>

            {!isCommercial && (
                <>
                    <div className="relative inline-block">
                        <select
                            value={filters?.beds || ''}
                            className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                            onChange={(e) => updateFilter('beds' as keyof Filters, e.target.value)}
                        >
                            <option value="">Bedrooms</option>
                            <option value="1">1 Bed</option>
                            <option value="2">2 Beds</option>
                            <option value="3">3 Beds</option>
                            <option value="4">4+ Beds</option>
                        </select>
                    </div>

                    <div className="relative inline-block">
                        <select
                            value={filters?.baths || ''}
                            className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                            onChange={(e) => updateFilter('baths' as keyof Filters, e.target.value)}
                        >
                            <option value="">Bathrooms</option>
                            <option value="1">1 Bath</option>
                            <option value="2">2 Baths</option>
                            <option value="3">3+ Baths</option>
                        </select>
                    </div>

                    <div className="relative inline-block">
                        <select
                            value={filters?.garages || ''}
                            className='custom-select py-3 text-gray dark:text-gray w-full pl-3 pr-9 border border-border dark:border-dark_border dark:focus:border-primary dark:bg-semidark rounded-lg focus:border-primary'
                            onChange={(e) => updateFilter('garages' as keyof Filters, e.target.value)}
                        >
                            <option value="">Garages</option>
                            <option value="1">1 Garage</option>
                            <option value="2">2+ Garages</option>
                        </select>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <>
            <HeroSub
                title={urlListingType || filters?.category || urlStatus || "Inventory List"}
                description=""
                breadcrumbLinks={breadcrumbLinks}
            />
            <section className='dark:bg-darkmode px-4 py-8'>
                <div className='lg:max-w-screen-xl max-w-screen-md mx-auto'>
                   
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

                    <div className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${isOffCanvasOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
                        <div
                            onClick={toggleOffCanvas}
                            className={`absolute inset-0 bg-gray-900 transition-opacity duration-300 ${isOffCanvasOpen ? 'opacity-50' : 'opacity-0'}`}
                        />
                        <div className={`absolute top-0 right-0 w-4/5 max-w-xs bg-white dark:bg-semidark shadow-lg h-full overflow-y-auto transition-transform duration-300 transform ${isOffCanvasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className='py-12 px-6 relative'>
                                <button onClick={toggleOffCanvas} className='absolute top-4 right-4 text-gray dark:text-gray-505 text-xl font-bold'>
                                    ✕
                                </button>
                                <p className='mb-6 text-2xl font-semibold'>Advanced Search</p>
                                <FilterContent />
                                <div className='mt-6'>
                                    <button
                                        onClick={toggleOffCanvas}
                                        className='bg-blue-500 hover:bg-blue-600 text-white w-full py-3 px-6 text-base rounded-lg transition-colors'
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='lg:grid lg:grid-cols-12 gap-6'>
                        <div className='hidden lg:block lg:col-span-4'>
                            <div className='py-10 px-6 bg-white dark:bg-semidark shadow-property rounded-lg'>
                                <p className='mb-6 text-2xl font-semibold'>Advanced Search</p>
                                <FilterContent />
                            </div>
                        </div>

                        <div className='col-span-12 lg:col-span-8'>
                            <div className="flex lg:flex-nowrap flex-wrap lg:gap-0 gap-6 w-full justify-between items-center pb-8 px-4">
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