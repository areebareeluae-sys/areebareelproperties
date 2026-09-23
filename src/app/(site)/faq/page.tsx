'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import HeroSub from "@/app/components/shared/hero-sub";
import Image from 'next/image';

export default function ChironFaqsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        // 01 General Services
        {
            q: "What services does Chiron Properties provide?",
            a: "Chiron Properties assists clients with buying, selling, renting, leasing, property marketing, tenant coordination, property viewings, negotiations, and transaction guidance.",
            category: "General Services"
        },
        {
            q: "What types of properties do you deal with?",
            a: "We can assist with residential and commercial properties, including apartments, villas, townhouses, offices, retail units, and selected investment properties, subject to availability.",
            category: "General Services"
        },
        {
            q: "Can Chiron Properties help both end-users and investors?",
            a: "Yes. We support clients looking for a home as well as investors seeking rental income, capital growth, or portfolio opportunities. Recommendations are based on the client's goals, budget, and preferred location.",
            category: "General Services"
        },
        {
            q: "How do I start working with Chiron Properties?",
            a: "Share your requirement, preferred area, budget, property type, and timeline. Our team can then shortlist relevant options and guide you through the next steps.",
            category: "General Services"
        },

        // 02 Buying a Property
        {
            q: "How can Chiron Properties help me buy a property?",
            a: "We help identify suitable properties, arrange viewings, provide available property information, coordinate offers, support negotiations, and guide you through the transaction process.",
            category: "Buying a Property"
        },
        {
            q: "What information should I provide before you shortlist properties?",
            a: "Please share your budget, preferred locations, property type, number of bedrooms or required size, purpose of purchase, payment preference, and target purchase timeline.",
            category: "Buying a Property"
        },
        {
            q: "Can you help me compare different properties?",
            a: "Yes. We can compare options based on factors such as location, price, layout, building or community, rental potential, payment terms, and your personal objectives.",
            category: "Buying a Property"
        },
        {
            q: "Can you assist with off-plan and ready properties?",
            a: "Yes, depending on current availability. We can assist with both ready and off-plan opportunities and explain the key differences in payment structure, handover timeline, occupancy, and resale considerations.",
            category: "Buying a Property"
        },
        {
            q: "Do you arrange property viewings?",
            a: "Yes. For available ready properties, our team can coordinate physical viewings. Where applicable, we may also provide photos, videos, floor plans, or virtual viewing material.",
            category: "Buying a Property"
        },
        {
            q: "Can Chiron Properties negotiate the price for me?",
            a: "We can communicate and negotiate offers on your behalf with the seller or authorized representative. Final acceptance remains subject to the seller's decision and transaction terms.",
            category: "Buying a Property"
        },

        // 03 Selling a Property
        {
            q: "How do I list my property with Chiron Properties?",
            a: "Provide the property details, ownership information, location, asking price, current occupancy status, and available photos or documents. Our team can review the listing requirements and advise on the next steps.",
            category: "Selling a Property"
        },
        {
            q: "How will you market my property?",
            a: "Depending on the agreed marketing plan, we may use property portals, our client database, direct inquiries, digital marketing, social media, agent networks, and targeted buyer outreach.",
            category: "Selling a Property"
        },
        {
            q: "How do you help determine an asking price?",
            a: "We can review comparable listings, location, property condition, size, size, view, floor, building or community, current demand, and other relevant market factors. The final asking price is decided by the owner.",
            category: "Selling a Property"
        },
        {
            q: "Will you handle buyer inquiries and viewings?",
            a: "Yes. We can qualify inquiries, coordinate viewing schedules, collect buyer feedback, and keep the owner updated on serious interest and offers.",
            category: "Selling a Property"
        },
        {
            q: "Can you help if my property is currently rented?",
            a: "Yes. The sale strategy will depend on the tenancy status, lease terms, access for viewings, and applicable transaction requirements. We will coordinate the process with the owner and tenant where needed.",
            category: "Selling a Property"
        },
        {
            q: "What happens when I receive an offer?",
            a: "We present the offer and its key terms to you, discuss any conditions, and support the negotiation. You remain in control of whether to accept, reject, or counter the offer.",
            category: "Selling a Property"
        },

        // 04 Renting and Tenant Services
        {
            q: "Can Chiron Properties help me find a rental property?",
            a: "Yes. Tell us your budget, preferred area, move-in date, property type, bedroom requirement, and any important preferences, and we can share suitable available options.",
            category: "Renting and Tenant Services"
        },
        {
            q: "What should I prepare before renting a property?",
            a: "You should be ready to provide the identification, contact, payment, and tenancy documentation required for the property and transaction. Exact requirements can vary by property and applicable regulations.",
            category: "Renting and Tenant Services"
        },
        {
            q: "Can you arrange multiple viewings in one day?",
            a: "Where schedules and access allow, we can coordinate several suitable properties to make the search process more efficient.",
            category: "Renting and Tenant Services"
        },
        {
            q: "Can I negotiate the rent?",
            a: "You may submit an offer. We can communicate your proposed rent and terms to the landlord, but the final decision remains with the landlord.",
            category: "Renting and Tenant Services"
        },
        {
            q: "What costs should I ask about before signing a tenancy?",
            a: "Ask for a clear breakdown of rent, security deposit, agency fee, utilities or service-related charges where applicable, payment schedule, and any other agreed costs.",
            category: "Renting and Tenant Services"
        },
        {
            q: "Can you help with renewal discussions?",
            a: "Where Chiron Properties is assisting with the renewal, we can coordinate communication between tenant and landlord regarding renewal terms and next steps.",
            category: "Renting and Tenant Services"
        },
        {
            q: "What should I do if I need maintenance after moving in?",
            a: "Follow the maintenance process stated in your tenancy or property handover documents and contact the landlord or designated maintenance contact for assistance.",
            category: "Renting and Tenant Services"
        },

        // 05 Investment and Transaction Support
        {
            q: "Can you recommend properties for investment?",
            a: "We can present options aligned with your stated goals and explain relevant property information such as price, location, rental demand, payment terms, and potential use. The final investment decision remains yours.",
            category: "Investment Support"
        },
        {
            q: "Do you guarantee rental returns or capital appreciation?",
            a: "No. Property values, rental income, occupancy, and investment performance can change. Any projections should be treated as estimates rather than guaranteed results.",
            category: "Investment Support"
        },
        {
            q: "Can you assist after the purchase is completed?",
            a: "Depending on your needs and our service scope, we may assist with leasing, tenant search, resale support, and future property requirements.",
            category: "Investment Support"
        },
        {
            q: "How can I contact Chiron Properties for a consultation?",
            a: "Contact our team with your property requirement and preferred contact method. We can arrange a discussion to understand your goals and recommend the appropriate next step.",
            category: "Investment Support"
        }
    ];

    const breadcrumbLinks = [
        { href: "/", text: "Home" },
        { href: "/faqs", text: "FAQs" },
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <HeroSub
                title="Chiron Properties Service FAQs"
                description="Buying | Selling | Renting | Tenants | Investment Support"
                breadcrumbLinks={breadcrumbLinks}
            />  

            {/* Intro Section */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                        Chiron Properties Support Guide
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3 leading-tight text-midnight_text dark:text-white">
                        Clear Answers to Common Property Questions
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed text-sm">
                        Designed for clients, website visitors, WhatsApp inquiries, and sales conversations. Property availability, fees, documentation, and regulations may vary by transaction.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Search Bar */}
                <div className="bg-white dark:bg-semidark p-4 rounded-xl shadow-sm border border-border dark:border-dark_border flex items-center gap-3">
                    <Icon icon="solar:magnifer-linear" className="text-gray" width="20" height="20" />
                    <input 
                        type="text" 
                        placeholder="Search questions or keywords (e.g., buying, renting, listing price)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-midnight_text dark:text-white focus:outline-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-xs text-gray hover:text-primary">Clear</button>
                    )}
                </div>

                {/* FAQs List Section */}
                <div className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border space-y-6">
                    <div className="border-b border-border dark:border-dark_border pb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-midnight_text dark:text-white">Frequently Asked Questions</h2>
                            <p className="text-xs text-gray dark:text-gray-505 mt-0.5">Browse through our complete service categories.</p>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-darkmode px-3 py-1 rounded-full text-gray">
                            Showing {filteredFaqs.length} of {faqs.length}
                        </span>
                    </div>

                    <div className="space-y-6 divide-y divide-border/50 dark:divide-dark_border/50">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, idx) => (
                                <div key={idx} className="pt-6 first:pt-0 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-midnight_text dark:text-white flex items-start gap-2">
                                            {faq.q}
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-md shrink-0">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray dark:text-gray-505 pl-4 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray">
                                <p>No matching questions found for "{searchQuery}".</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Support Section */}
                <div className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-8 border border-border dark:border-dark_border text-center space-y-3">
                    <h3 className="text-lg font-bold text-midnight_text dark:text-white">Need help with a property?</h3>
                    <p className="text-xs text-gray dark:text-gray-505 max-w-lg mx-auto">
                        Share your requirement with Chiron Properties — whether you want to buy, sell, rent, lease, or explore an investment — and the team can guide you through the available options and next steps.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all duration-200 text-sm"
                        >
                            <Icon icon="solar:phone-calling-linear" width="18" height="18" />
                            Contact Our Team
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}