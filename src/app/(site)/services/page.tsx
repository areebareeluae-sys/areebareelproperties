import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import Services from "@/app/components/home/Services/page";

export const metadata: Metadata = {
  title: "Our Services | Chiron Properties",
};

export default function ServicesPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
  ];

  return (
    <div className="bg-white dark:bg-darkmode min-h-screen text-black dark:text-white">
      {/* Sub Header */}
      <HeroSub
        title="Our Services"
        description="Explore Chiron Properties' elite suite of real estate solutions, designed to protect your investments and maximize value."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* 1. Feature Service Banner (Property Management & Professional Inspection) */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-border dark:border-dark_border">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                alt="Property Management and Inspection"
                fill
                className="object-cover hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/20 px-3 py-1 rounded-full backdrop-blur-md">
                    Asset Care & Safety
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">Comprehensive Management & Inspection</h3>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                01 & 02 — Protection & Integrity
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Property Management & Professional Inspection
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                At Chiron Properties, we safeguard your investments. Our comprehensive management services handle tenants, rent collection, and maintenance effortlessly. Coupled with our thorough professional inspections, we evaluate structural integrity to uncover hidden issues before you buy, sell, or lease.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-semidark border border-border dark:border-dark_border">
                  <h4 className="font-bold text-primary text-lg">Yield Maximization</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hassle-free passive income and tenant care.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-semidark border border-border dark:border-dark_border">
                  <h4 className="font-bold text-primary text-lg">Structural Safety</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expert-led risk and quality assessments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
<Services/>

      {/* 3. After Sales Support Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                06 — Long-Term Partnership
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Dedicated After Sales Support
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                At Chiron Properties, our relationship doesn't end when the deal closes. We provide dedicated assistance long after paperwork is signed, handling legal documentation transfers, smooth maintenance transitions, and continuous client queries with utmost care.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Complete legal documentation & title transfer guidance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Seamless utility & maintenance handovers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Ongoing client support and portfolio advisory
                </li>
              </ul>
            </div>

            <div className="relative h-[400px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-border dark:border-dark_border order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="After Sales Support Chiron Properties"
                fill
                className="object-cover hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/20 px-3 py-1 rounded-full backdrop-blur-md">
                    Client First
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">We Stand With You Beyond the Deal</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-black text-white dark:bg-semidark border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/20 px-3 py-1 rounded-md">
            Let's Talk Business
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Ready to Experience Excellence with Chiron Properties?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Schedule a private, one-on-one consultation with our expert advisors and let us handle your real estate journey from start to finish.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg text-sm tracking-wider uppercase"
          >
            Book Your Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}