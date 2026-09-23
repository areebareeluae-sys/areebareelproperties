import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import HeroSub from "@/app/components/shared/hero-sub";
import { Metadata } from "next";

// 1. Metadata function ke bahar shift kar diya gaya hai
export const metadata: Metadata = {
  title: "Property Management | Chiron Properties",
};

export default function PropertyManagementPage() {
  const features = [
    "Comprehensive Tenant Screening & Selection",
    "Regular Maintenance & Property Inspections",
    "Rent Collection & Financial Reporting",
    "24/7 Emergency Support & Tenant Relations"
  ];

  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
    { href: "/property-management", text: "Property Management" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Sub Hero Section */}
      <HeroSub
        title="Property Management"
        description="We handle every aspect of property management and keep your property in excellent condition to help you get the best returns."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border space-y-8 relative overflow-hidden">
          
          {/* Coming Soon Top Badge */}
          <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-4">
            <span className="inline-block bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-full">
              Coming Soon
            </span>
            <span className="text-xs text-gray dark:text-gray-505 font-medium">
              Chiron Properties Services
            </span>
          </div>

          {/* Description Block */}
          <div>
            <h2 className="text-2xl font-bold text-midnight_text dark:text-white mb-3">
              Maximize Your Rental Returns
            </h2>
            <p className="text-sm sm:text-base text-gray dark:text-gray-505 leading-relaxed">
              We handle every aspect of property management and keep your property in excellent condition to help you get the best returns. Let our experts take care of tenants, maintenance, and reporting while you enjoy hassle-free passive income.
            </p>
          </div>

          {/* Highlights Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">
              Core Management Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-darkmode/50 border border-border/60 dark:border-dark_border"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon icon="solar:check-read-linear" width="20" height="20" />
                  </div>
                  <span className="text-sm font-semibold text-midnight_text dark:text-white">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action / Back Button */}
          <div className="pt-4 border-t border-border dark:border-dark_border flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray dark:text-gray-505">
              Interested in our property management services? Get in touch with our team today.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}