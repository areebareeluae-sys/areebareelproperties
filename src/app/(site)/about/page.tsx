import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import Services from "../../components/home/Services/page";

export const metadata: Metadata = {
  title: "About Us | Chiron Properties",
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
        description="Discover our journey, how we work, our core values, and the dedicated team behind Chiron Properties."
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
                Building Trust and Simplicity in Real Estate
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Chiron Properties was founded with a clear goal: to make buying, selling, and managing properties simple, transparent, and stress-free. We connect property seekers and investors with verified, high-value real estate opportunities.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                From residential homes to commercial investments, our focus is always on putting our clients first, backed by honest guidance and reliable market insights.
              </p>
              
              <div className="grid grid-cols-3 gap-4 border-t border-border dark:border-dark_border pt-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">10+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Years Experience</p>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-1">$500M+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Properties Handled</p>
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
                  alt="Chiron Properties Story"
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
            <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-3">Our Simple Approach</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">We guide you through every step of your real estate journey with clarity and care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Consultation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">We understand your needs, budget, and goals to suggest the right property options for you.</p>
            </div>

            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Listings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Every property undergoes thorough legal and structural checks so you can invest with total peace of mind.</p>
            </div>

            <div className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-semibold mb-2">Smooth Closing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">From paperwork and negotiations to final handover, we handle everything smoothly.</p>
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
              <h2 className="text-3xl font-bold mt-4 mb-4">Core Values That Guide Us</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                At Chiron Properties, our principles define who we are and how we serve our clients every single day.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">100% Transparency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clear pricing, clear terms, and no hidden surprises.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Quality Properties</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hand-picked residential and commercial spaces built to last.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Client First</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your satisfaction and success are our highest priorities.</p>
              </div>
              <div className="p-6 rounded-xl border border-border dark:border-dark_border bg-white dark:bg-semidark">
                <h3 className="text-lg font-semibold text-primary mb-2">Reliable Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">We stand by your side long after the deal is completed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Component */}
      <Services />

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

      {/* 6. Careers Banner */}
      <section className="py-16 bg-black text-white dark:bg-semidark border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Want to Join the Chiron Properties Team?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
            We are always looking for passionate property experts and advisors to grow with us.
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