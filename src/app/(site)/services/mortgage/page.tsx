import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
  title: "Mortgage Services | Chiron Properties",
};

export default function MortgagePage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
    { href: "/mortgage", text: "Mortgage" },
  ];

  const mortgageSteps = [
    {
      title: "Mortgage pre-approval",
      desc: "Get pre-approved quickly to understand your budget and strengthen your buyer position."
    },
    {
      title: "Bank comparison & rate negotiation",
      desc: "We compare top banking partners to secure the most competitive interest rates for you."
    },
    {
      title: "Loan approval management",
      desc: "End-to-end documentation and submission management to fast-track your loan approval."
    },
    {
      title: "Non-resident & expat mortgages",
      desc: "Specialized financing solutions tailored for international investors and expatriates."
    },
    {
      title: "Financial guidance & budget planning",
      desc: "Expert advice tailored to your financial goals and long-term investment strategy."
    },
    {
      title: "Post-approval service",
      desc: "Continued support throughout your property financing and ownership journey."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-16">
      {/* Sub Header */}
      <HeroSub
        title="Mortgage Services"
        description="We get you the best mortgage deals with help from our trusted banking partners and mortgage advisors."
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12">
        
        {/* 1. Main Mortgage & Path to Ownership Section */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10  dark:border-dark_border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
                Chiron Properties Services
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-midnight_text dark:text-white mt-4 mb-6 leading-tight">
                Simplifying Your Path to Property Ownership
              </h2>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-4 leading-relaxed">
                Becoming a homeowner can be a stressful process if you don’t secure the right mortgage. At Chiron Properties, we simplify this process with our seasoned mortgage specialists, who offer personalised advice tailored to your financial goals.
              </p>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-6 leading-relaxed">
                Selecting a suitable loan product to secure competitive interest rates and swift approvals, our experienced team will support your mortgage solutions at every stage of your property financing journey.
              </p>

              <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-darkmode/50 /60 dark:border-dark_border text-midnight_text dark:text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl">
                <Icon icon="solar:check-circle-linear" width="20" height="20" className="text-primary" />
                Trusted banking partners & expert mortgage advisors
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden   dark:border-dark_border bg-gray-100 dark:bg-darkmode/50">
                <Image
                  src="/images/mortgage.jpg" 
                  alt="Mortgage Services"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. How We Manage Your Process */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10  dark:border-dark_border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
              Financing Process
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-midnight_text dark:text-white mt-3 mb-3">
              How We Manage Your Mortgage
            </h2>
            <p className="text-sm text-gray dark:text-gray-505">
              Comprehensive support from pre-approval to final bank disbursement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mortgageSteps.map((step, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-darkmode/50 p-6 rounded-xl /60 dark:border-dark_border flex items-start gap-4"
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
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10  dark:border-dark_border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl /60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">60,000+</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Properties Rented to Date</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl /60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">50+</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Years of Market Experience</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl /60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">7.5B</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Cumulative Value of Properties Sold</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-darkmode/50 rounded-xl /60 dark:border-dark_border">
              <h5 className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">99%</h5>
              <p className="text-xs text-gray dark:text-gray-505 font-medium">Occupancy Rate Across Portfolio</p>
            </div>
          </div>
        </section>

        {/* 4. Action Banner */}
        <section className="bg-midnight_text dark:bg-semidark text-white rounded-2xl p-8 sm:p-12  dark:border-dark_border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Ready to secure the best mortgage deal?</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Get in touch with our mortgage advisors for personalized financial guidance.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition  shrink-0"
          >
            Contact Us
          </Link>
        </section>

      </div>
    </main>
  );
}