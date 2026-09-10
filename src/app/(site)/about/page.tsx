import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import DiscoverProperties from '../../components/home/property-option';
import Listing from '../../components/home/property-list';
export const metadata: Metadata = {
  title: "About Us | Property-pro",
};

export default function AboutPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About Us" },
  ];

  return (
    <div className="bg-white dark:bg-darkmode min-h-screen text-black dark:text-white">
      {/* Sub Header */}
      <HeroSub
        title="About Us"
        description="Discover our rich story, strategic approach, core values, and the expert leadership driving your trusted property platform."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* 1. Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 leading-tight">
                Redefining Real Estate & Cross-Border Property Advisory
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Founded with a vision to streamline property transactions across regions like Pakistan and the UAE, Property-pro has evolved into a comprehensive digital ecosystem. We combine deep market intelligence with advanced technology to bridge the gap between discerning investors, homeowners, and premium developers.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                From high-yield off-plan developments to luxury ready properties, our journey is rooted in transparency, data-backed insights, and client-first execution.
              </p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-border dark:border-dark_border pt-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">10+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Years Experience</p>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">$500M+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transactions Facilitated</p>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">5K+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Happy Clients</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-xl border border-border dark:border-dark_border bg-gray-100 dark:bg-semidark">
                <Image
                  src="/images/properties/default.jpg" 
                  alt="Our Story"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Approach Section */}
      <section className="py-16 bg-gray-50 dark:bg-semidark/30 border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
              How We Work
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-3">Our Strategic Approach</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">We don’t just list properties; we analyze market trends, evaluate risk, and align investments with long-term financial objectives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-semibold mb-2">Market Intelligence</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Leveraging deep research, historical data, and live forecasting to identify high-potential growth corridors.</p>
            </div>

            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-semibold mb-2">Rigorous Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Every asset undergoes strict legal, title, and developer credibility checks before presentation.</p>
            </div>

            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Execution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">From initial advisory and cross-border paperwork to post-purchase management, we handle it all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                Our Ethos
              </span>
              <h2 className="text-3xl font-bold mt-4 mb-4">Core Values That Drive Us</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Our culture is built on unwavering principles that ensure absolute trust between our advisors, developers, and investors.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Transparency First</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clear pricing, zero hidden fees, and absolute honesty in every consultation.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Uncompromising Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Curating only elite residential and commercial assets with high appreciation value.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Client Centricity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tailoring strategies to match specific financial goals, risk appetite, and timelines.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Innovation & Speed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Utilizing modern web tech to deliver lightning-fast asset search and transaction updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <DiscoverProperties />
      <Listing />
      {/* 4. Leadership & Advisors */}
      <section className="py-16 bg-gray-50 dark:bg-semidark/30 border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
              Expert Guidance
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-3">Leadership & Advisors</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Industry veterans with decades of collective experience in international real estate and finance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Talha Mehmood", role: "Managing Director & Founder", img: "/images/properties/default.jpg" },
              { name: "Ahmad Khan", role: "Head of Real Estate Advisory", img: "/images/properties/default.jpg" },
              { name: "Sarah Al-Maktoum", role: "Cross-Border Investment Lead", img: "/images/properties/default.jpg" }
            ].map((leader, index) => (
              <div key={index} className="bg-white dark:bg-semidark rounded-xl overflow-hidden border border-border dark:border-dark_border text-center p-6">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 border-2 border-primary/20">
                  <Image src={leader.img} alt={leader.name} fill className="object-cover" />
                </div>
                <h3 className="text-lg font-bold">{leader.name}</h3>
                <p className="text-xs text-primary font-medium mt-1">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
            Collaborations
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-8">Trusted Industry Partners</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center opacity-70">
            {["Emaar Properties", "DAMAC", "Bahria Town", "Nakheel"].map((partner, i) => (
              <div key={i} className="p-6 border border-border dark:border-dark_border rounded-xl font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Careers Banner (Optional) */}
      <section className="py-16 bg-black text-white dark:bg-semidark border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to Join Our Growing Team?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
            We are always looking for passionate property consultants, developers, and market analysts to shape the future of real estate.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition shadow-md"
          >
            Get in Touch / Careers
          </Link>
        </div>
      </section>
    </div>
  );
}