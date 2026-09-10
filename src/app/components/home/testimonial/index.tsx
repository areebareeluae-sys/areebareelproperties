import React from 'react';
import Image from 'next/image';

export default function Testimonials() {
    return (
        <section className="px-4 md:px-0 dark:bg-darkmode py-12">
            <div className="container lg:max-w-screen-xl md:max-w-screen-md px-8 mx-auto py-12 flex flex-col-reverse md:flex-row items-center justify-between">
                <div className="flex flex-col md:flex-row justify-between items-center w-full gap-12">
                    <div className="flex-1 lg:block hidden" data-aos="fade-right">
                        <Image
                            src="/images/testimonial/vector-smart.png"
                            alt="testimonial client"
                            width={451}
                            height={470}
                            quality={100}
                            style={{ width: "auto", height: "auto" }}
                        />
                    </div>
                    <div className="flex-1" data-aos="fade-left">
                        <Image
                            src="/images/testimonial/quote.svg"
                            alt="quote icon"
                            className="mb-4 md:mb-6 opacity-80"
                            height={80}
                            width={80}
                        />
                        <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed font-medium">
                            &quot;Finding the right investment property seemed overwhelming until I connected with their advisory team. Their market insights, transparent paperwork, and dedicated support helped me secure a high-yield property seamlessly. Highly recommended!&quot;
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-midnight_text dark:text-white">Alexander Wright</p>
                        <p className="text-primary text-base md:text-lg font-semibold mt-1">Property Investor & Homeowner</p>
                    </div>
                </div>
            </div>
        </section>
    );
}