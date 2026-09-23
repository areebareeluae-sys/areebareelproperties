import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
  title: "Professional Inspection & Snagging | Chiron Properties",
};

export default function ProfessionalInspectionPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/services", text: "Services" },
    { href: "/professional-inspection", text: "Professional Inspection" },
  ];

  const inspectionSteps = [
    {
      title: "Detailed property inspection",
      desc: "From painting defects to plumbing, and lights to floors, every single aspect is inspected."
    },
    {
      title: "Inspection report documentation",
      desc: "Comprehensive documentation of any defects or unfinished work found during the check."
    },
    {
      title: "Follow-up and developer coordination",
      desc: "We coordinate to ensure all issues are resolved before the official handover."
    },
    {
      title: "Post-completion verification",
      desc: "A thorough re-check to confirm everything is fixed before it becomes officially your place."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-16">
      {/* Sub Header */}
      <HeroSub
        title="Professional Inspection & Snagging"
        description="Snagging or professional inspections are arranged to resolve any defects or unfinished work before the handover. Protect your investment before handover."
        breadcrumbLinks={breadcrumbLinks}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12">
        
        {/* 1. Main Inspection & Protection Section (Matching Reference Layout) */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
                Chiron Properties Services
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-midnight_text dark:text-white mt-4 mb-6 leading-tight">
                Protect Your Investment Before Handover
              </h2>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-4 leading-relaxed">
                New-build and off-plan properties are often delivered with minor defects that usually go unnoticed.
              </p>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-4 leading-relaxed">
                Our Professional Inspection or Property Snagging services are conducted to identify any defects or unfinished work in your newly renovated home before you purchase it – a thorough check before it’s officially your place.
              </p>
              <p className="text-sm sm:text-base text-gray dark:text-gray-505 mb-6 leading-relaxed">
                Painting defects to plumbing, and lights to floors, every single aspect is inspected, reported, and resolved before handover.
              </p>

              <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-darkmode/50 border border-border/60 dark:border-dark_border text-midnight_text dark:text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl">
                <Icon icon="solar:check-circle-linear" width="20" height="20" className="text-primary" />
                Tailored snagging for all property types
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border dark:border-dark_border bg-gray-100 dark:bg-darkmode/50">
                <Image
                  src="/images/professional-inspection.png" 
                  alt="Professional Inspection and Snagging"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. How We Manage Your Inspection Process */}
        <section className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
              Process & Quality
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-midnight_text dark:text-white mt-3 mb-3">
              How We Manage Your Inspection Process
            </h2>
            <p className="text-sm text-gray dark:text-gray-505">
              A systematic approach to guarantee absolute flawlessness before you take ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {inspectionSteps.map((step, index) => (
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
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Ready to inspect your next property?</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Get in touch with our experts to secure a professional snagging session.</p>
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