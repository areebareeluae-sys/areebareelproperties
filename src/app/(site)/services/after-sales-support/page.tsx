import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
  title: "After Sales Support | Chiron Properties",
};

export default function AfterSalesSupportPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
    { href: "/after-sales-support", text: "After Sales Support" },
  ];

  const supportSteps = [
    {
      title: "Title deed preparation & registration",
      desc: "We assist with official paperwork, government registrations, and secure deed processing."
    },
    {
      title: "Utility connection & registration",
      desc: "Seamless setup of electricity, water, and telecom connections for your new property."
    },
    {
      title: "Property handover inspection",
      desc: "Thorough final checks to ensure everything meets the agreed standard before moving in."
    },
    {
      title: "After-sales fit-outs coordination",
      desc: "Assistance with interior enhancements, renovations, and fit-out approvals."
    },
    {
      title: "Assistance with resale intentions",
      desc: "Guidance and strategic advice if you decide to monetize, rent, or resell your property."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-16">
      {/* Sub Header */}
      <HeroSub
        title="After Sales Support"
        description="We manage everything from paperwork to handover, even after the sale is done."
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12">
        
        {/* 1. Main After Sales Support & Journey Section */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
                Chiron Properties Services
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-midnight_text dark:text-white mt-4 mb-6 leading-tight">
                Support That Continues After the Sale
              </h2>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-4 leading-relaxed">
                The moment you receive the keys is just the beginning of your property journey. At Chiron Properties, our service extends beyond simply handing over the keys.
              </p>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-6 leading-relaxed">
                Our team of experienced professionals, with extensive knowledge of property laws, registration processes, utility connections, and more, provides after-sales support. We remain available to assist with any queries that arise after handover, including future resale or rental considerations.
              </p>

              <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-darkmode/50 border border-border/60 dark:border-dark_border text-midnight_text dark:text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl">
                <Icon icon="solar:check-circle-linear" width="20" height="20" className="text-primary" />
                Dedicated long-term client care and registration assistance
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border dark:border-dark_border bg-gray-100 dark:bg-darkmode/50">
                <Image
                  src="/images/after-sales-support.png" 
                  alt="After Sales Support"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. How We Manage Your Support Process */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
              Post-Handover Services
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-midnight_text dark:text-white mt-3 mb-3">
              How We Manage Your Property Post-Sale
            </h2>
            <p className="text-sm text-gray dark:text-gray-505">
              Comprehensive assistance handling all legal, utility, and transition requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportSteps.map((step, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-darkmode/50 p-6 rounded-xl border border-border/60 dark:border-dark_border flex items-start gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon icon="solar:shield-check-linear" width="24" height="24" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-midnight_text dark:text-white mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray dark:text-gray-505 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Company Stats Section */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl border border-border/60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">60,000+</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Properties Rented to Date</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl border border-border/60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">50+</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Years of Market Experience</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl border border-border/60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">7.5B</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Cumulative Value of Properties Sold</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl border border-border/60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">99%</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Occupancy Rate Across Portfolio</p>
            </div>
          </div>
        </section>

        {/* 4. Action Banner */}
        <section className="bg-midnight_text dark:bg-semidark text-white rounded-2xl p-8 sm:p-12 border border-border dark:border-dark_border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Need post-handover guidance?</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Get in touch with our after-sales support team for smooth transitions.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition shadow-lg shrink-0"
          >
            Contact Us
          </Link>
        </section>

      </div>
    </main>
  );
}