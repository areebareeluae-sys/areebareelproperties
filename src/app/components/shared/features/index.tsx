"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function Features() {
    const [propertiesData, setPropertiesData] = useState<any[]>([]);

    // Aapki company ki real services ka professional text
    const companyFeatures = [
        {
            id: 1,
            title: "Verified Property Listings",
            description: "100% legally verified residential and commercial properties with transparent documentation.",
            imgSrc: "/images/features/feature_icon1.svg" // Agar image path mein issue ho toh placeholder ya icon use kar sakte hain
        },
        {
            id: 2,
            title: "Expert Investment Advisory",
            description: "Data-driven market insights and ROI projections to maximize your capital growth.",
            imgSrc: "/images/features/feature_icon2.svg"
        },
        {
            id: 3,
            title: "End-to-End Transaction Support",
            description: "Complete legal, financial, and paperwork assistance from initial booking to final handover.",
            imgSrc: "/images/features/feature_icon3.svg"
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resProperties = await fetch('/api/propertydata');
                if (resProperties.ok) {
                    const properties = await resProperties.json();
                    setPropertiesData(properties || []);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchData();
    }, []);

    const value = propertiesData.filter((item) => {
        return !item.check;
    });

    return (
        <section className='dark:bg-darkmode py-16'>
            <div className="container px-4 lg:max-w-screen-xl md:max-w-screen-md mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="flex lg:flex-row flex-col lg:gap-0 gap-8 justify-between w-full items-center">
                    <div className='mb-8 md:mb-0 flex-1 w-full'>
                        <div className='relative' data-aos="fade-right">
                            <Image
                                src="/images/features/features_iimage.jpg"
                                alt='Real Estate Portfolio'
                                width={640}
                                height={615}
                                style={{ width: "100%", height: "auto" }}
                                className="rounded-2xl"
                            />
                            <div className="lg:max-w-96 max-w-37.5 absolute bottom-0 mx-auto left-0 right-0 lg:mr-3.75">
                                {value.map(property => (
                                    <div key={property.id} className="bg-white shadow-2xl rounded-t-xl overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                                        <div className='relative'>
                                            <Image
                                                src={property.image || "/uploads/1788676552109-Screenshot_2025-07-07_010304.png"}
                                                alt="Featured Property"
                                                height={235}
                                                width={370}
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className='absolute top-[10px] right-[10px] bg-white p-2 rounded-lg shadow-md'
                                                viewBox="0 0 24 24"
                                                width="38"
                                                height="38"
                                                fill="#2F73F2"
                                            >
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        </div>
                                        <div className="p-4 dark:bg-[#111929]">
                                            <div className="flex dark:text-gray justify-between items-center mb-1">
                                                <div className="font-bold text-2xl text-primary">{property.property_price}</div>
                                                <div className='text-xs bg-herobg dark:bg-white dark:text-blue-500 py-2 px-4 rounded-lg font-bold'>
                                                    {property.location}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray font-medium truncate">{property.property_title}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 w-full'>
                        <div className="lg:pl-16 flex flex-col justify-center h-full">
                            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md w-max mb-3">
                                Why Choose Our Real Estate Services
                            </span>
                            <p className='mb-8 text-3xl md:text-4xl font-bold text-midnight_text dark:text-white leading-tight' data-aos="fade-left">
                                Delivering Trusted Property Solutions & High ROI Investments
                            </p>
                            {companyFeatures.map(feature => (
                                <div key={feature.id} className='flex mb-6 items-start gap-6' data-aos="fade-left" data-aos-delay="100">
                                    <div className="bg-primary/10 p-4 rounded-2xl flex justify-center items-center shrink-0">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            ✓
                                        </div>
                                    </div>
                                    <div className='flex-col'>
                                        <p className='text-xl mb-1 text-midnight_text dark:text-white font-bold'>{feature.title}</p>
                                        <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}