import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Services | Property-pro",
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
        description="Explore our elite suite of real estate advisory, asset management, and cross-border investment solutions."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* 1. Feature Service Banner (Buy & Invest) */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-border dark:border-dark_border">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"
                alt="Buy and Invest Property"
                fill
                className="object-cover hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/20 px-3 py-1 rounded-full backdrop-blur-md">
                    Core Pillars
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">Smart Buying & High-Yield Investing</h3>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                01 & 02 — Acquisition & Growth
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Strategic Property Buying & Investment Advisory
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                Whether you are looking for your dream luxury villa or a high-ROI commercial asset, we leverage deep market intelligence to hand-pick verified opportunities. Our advisory team evaluates risks, tracks historical trends, and maximizes your capital growth.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-semidark border border-border dark:border-dark_border">
                  <h4 className="font-bold text-primary text-lg">Verified Assets</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Strict legal & title checks on every listing.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-semidark border border-border dark:border-dark_border">
                  <h4 className="font-bold text-primary text-lg">Data-Driven ROI</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Focused on high-appreciation corridors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Cards for Sell, Lease & Management */}
      <section className="py-20 bg-gray-50 dark:bg-semidark/30 border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
              Lifecycle Management
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Sell, Lease & Asset Care</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We ensure maximum market visibility for sellers and hassle-free passive income for landlords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sell Property */}
            <div className="bg-white dark:bg-semidark rounded-2xl overflow-hidden border border-border dark:border-dark_border shadow-xs flex flex-col justify-between group">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80"
                  alt="Sell Property"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary">03 / Quick Liquidity</span>
                  <h3 className="text-xl font-bold mt-2 mb-3">Sell Property</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Professional media staging, targeted multi-channel marketing, and rapid deal closing executed by top negotiators.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border dark:border-dark_border">
                  <Link href="/contact" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    List Your Property &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Leasing Solutions */}
            <div className="bg-white dark:bg-semidark rounded-2xl overflow-hidden border border-border dark:border-dark_border shadow-xs flex flex-col justify-between group">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80"
                  alt="Leasing Solutions"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary">04 / Rental Management</span>
                  <h3 className="text-xl font-bold mt-2 mb-3">Leasing Solutions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Thorough tenant background checks, secure lease documentation, and automated rent scheduling for seamless tenancy.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border dark:border-dark_border">
                  <Link href="/contact" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Find Tenants &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Property Management */}
            <div className="bg-white dark:bg-semidark rounded-2xl overflow-hidden border border-border dark:border-dark_border shadow-xs flex flex-col justify-between group">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80"
                  alt="Property Management"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary">05 / Peace of Mind</span>
                  <h3 className="text-xl font-bold mt-2 mb-3">Property Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    End-to-end physical asset care, routine maintenance supervision, utility tracking, and complete owner representation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border dark:border-dark_border">
                  <Link href="/contact" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Explore Management &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Land Development & Cross-Border Advisory */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                06 & 07 — Scale & International
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Land, Development & Cross-Border Advisory
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                For large-scale developers and international investors, we provide master-planning consultation, zoning law analysis, and seamless cross-border financial channeling between Pakistan, the UAE, and worldwide hubs.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Land acquisition & feasibility studies
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> International property portfolio diversification
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Regulatory & legal cross-border compliance
                </li>
              </ul>
            </div>

            <div className="relative h-[400px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-border dark:border-dark_border order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Cross-Border Advisory Skyline"
                fill
                className="object-cover hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/20 px-3 py-1 rounded-full backdrop-blur-md">
                    Global Reach
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-3">Connecting Global Markets Seamlessly</h3>
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
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Ready to Accelerate Your Real Estate Goals?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Schedule a private, one-on-one consultation with our senior advisors and get custom tailored execution frameworks.
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