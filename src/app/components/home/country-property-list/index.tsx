"use client";
import { useEffect, useState } from 'react';
import PropertyCard from './property-card';
import Link from 'next/link';

const Listing = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>("");

    // 1. LocalStorage se selected country read karna
    useEffect(() => {
        const country = localStorage.getItem("selected_country");
        if (country) {
            setSelectedCountry(country);
        }
    }, []);

    // 2. API se properties fetch karna
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/propertydata');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();
                setProperties(data || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchData();
    }, []);

    // 3. Smart Country Matching (UAE / United Arab Emirates & Pakistan / PK ke liye)
    const isCountryMatch = (propertyCountry?: string, selected?: string) => {
        if (!selected) return true; // Agar koi country select na ho toh sab show karein
        if (!propertyCountry) return false;

        const pCountry = propertyCountry.toLowerCase().trim();
        const sCountry = selected.toLowerCase().trim();

        // Agar user ne UAE select kiya hai toh dono formats match honge
        if (sCountry === "uae" || sCountry === "united arab emirates") {
            return pCountry === "uae" || pCountry === "united arab emirates";
        }

        // Agar user ne Pakistan select kiya hai toh dono formats match honge
        if (sCountry === "pakistan" || sCountry === "pk") {
            return pCountry === "pakistan" || pCountry === "pk";
        }

        // Baqi countries ke liye direct match
        return pCountry === sCountry;
    };

    // Filter properties based on smart check
    const filteredProperties = properties.filter((property) => 
        isCountryMatch(property.country, selectedCountry)
    );

    return (
        <section className="bg-white dark:bg-semidark flex justify-center items-center py-12">
            <div className="lg:max-w-screen-xl md:max-w-screen-md mx-auto container px-4">
                <h1 className="text-4xl font-bold text-center mb-12 text-midnight_text dark:text-white" data-aos="fade-up">
                    Featured Properties {selectedCountry ? `in ${selectedCountry}` : ""}
                </h1>

                {filteredProperties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProperties.slice(0, 6).map((property, index) => (
                                <div key={property.id || index} data-aos="fade-up" data-aos-delay={`${index * 100}`}>
                                    <PropertyCard property={property} />
                                </div>
                            ))}
                        </div>

                        {/* Agar total properties 6 se zyada hain toh niche button show hoga */}
                        {filteredProperties.length > 6 && (
                            <div className="text-center mt-12" data-aos="fade-up">
                                <Link 
                                    href="/properties/properties-list" 
                                    className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    View All Properties ({filteredProperties.length})
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-darklight rounded-lg shadow-sm">
                        <p className="text-gray-600 dark:text-gray-300 text-base">
                            No properties found for {selectedCountry || "your selected region"}.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Listing;