"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CountryModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedCountry = localStorage.getItem("selected_country");
        if (!savedCountry) {
            setIsOpen(true);
        }
    }, []);

    const handleCountrySelect = (country: string) => {
        localStorage.setItem("selected_country", country);
        setIsOpen(false);
        window.location.reload();
    };

    if (!isOpen) return null;

    const services = [
        "Professional Inspection",
        "Brokerage",
        "Mortgage",
        "Property Listing & Marketing",
        "After Sales Support"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background Image with Dark Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/images/hero/pexels-maria-charizani-3542905-5577693.jpg')` }}
            >
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md"></div>
            </div>

            {/* Modal Box */}
            <div className="relative bg-white/95 dark:bg-semidark/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-center border border-white/10 dark:border-dark_border z-10 animate-fadeIn">
                
                {/* Heading & Intro */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-black dark:text-white">
<<<<<<< HEAD
                    Select Your Country
                </h3>
                

              
=======
                   Select Your Country
                </h3>
                

               
>>>>>>> bf65f5d916ff3907fd5560ad84a5a4813fd2c2b4

                {/* Buttons with Real SVG Flags */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleCountrySelect("UAE")}
                        className="group relative flex items-center justify-center gap-2.5 p-3 rounded-lg border-2 border-gray-200 dark:border-dark_border bg-white dark:bg-darklight hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-300 text-center cursor-pointer"
                    >
                        <Image 
                            src="https://flagcdn.com/ae.svg" 
                            alt="UAE Flag" 
                            width={24} 
                            height={18} 
                            className="rounded-xs shadow-xs object-cover"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-black dark:text-white group-hover:text-primary transition-colors">
                            United Arab Emirates
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleCountrySelect("PK")}
                        className="group relative flex items-center justify-center gap-2.5 p-3 rounded-lg border-2 border-gray-200 dark:border-dark_border bg-white dark:bg-darklight hover:border-primary dark:hover:border-primary hover:shadow-md transition-all duration-300 text-center cursor-pointer"
                    >
                        <Image 
                            src="https://flagcdn.com/pk.svg" 
                            alt="Pakistan Flag" 
                            width={24} 
                            height={18} 
                            className="rounded-xs shadow-xs object-cover"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-black dark:text-white group-hover:text-primary transition-colors">
                            Pakistan
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
}
