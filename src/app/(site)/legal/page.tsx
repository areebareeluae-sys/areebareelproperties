import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal & Regulatory Disclosures | Property-pro",
};

export default function LegalPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/legal", text: "Legal" },
  ];

  return (
    <div className="bg-white dark:bg-darkmode min-h-screen text-black dark:text-white">
      {/* Sub Header */}
      <HeroSub
        title="Legal & Disclosures"
        description="Review our terms, privacy commitments, regulatory notices, and operational policies."
        breadcrumbLinks={breadcrumbLinks}
      />

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* Quick Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-gray-50 dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-4">On This Page</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#terms" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Terms of Service</a></li>
                  <li><a href="#privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Privacy Policy</a></li>
                  <li><a href="#cookies" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Cookie Policy</a></li>
                  <li><a href="#disclaimer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">General Disclaimer</a></li>
                  <li><a href="#regulatory" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Regulatory Disclosures</a></li>
                  <li><a href="#accessibility" className="text-gray-600 dark:text-gray-300 hover:text-primary transition">Accessibility</a></li>
                </ul>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* 1. Terms */}
              <div id="terms" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 01
                </span>
                <h2 className="text-2xl font-bold">Terms of Service</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Welcome to Property-pro. By accessing or using our platform, website, and digital property services, you agree to comply with and be bound by these terms. If you do not agree to all terms, please refrain from using our services.
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  All listings, pricing details, and market insights provided are for general information purposes and subject to modification by developers or sellers without prior notice.
                </p>
              </div>

              <hr className="border-border dark:border-dark_border" />

              {/* 2. Privacy */}
              <div id="privacy" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 02
                </span>
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Your privacy is paramount to us. We collect personal details (such as names, phone numbers, and email addresses) solely for consultation bookings, transaction execution, and improving your browsing experience. We never sell or trade your data to unauthorized third parties.
                </p>
              </div>

              <hr className="border-border dark:border-dark_border" />

              {/* 3. Cookies */}
              <div id="cookies" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 03
                </span>
                <h2 className="text-2xl font-bold">Cookie Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Our website uses cookies to analyze traffic, remember your preferences, and maintain user sessions (such as saved properties or login state). You can control or disable cookies through your browser settings at any time.
                </p>
              </div>

              <hr className="border-border dark:border-dark_border" />

              {/* 4. Disclaimer */}
              <div id="disclaimer" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 04
                </span>
                <h2 className="text-2xl font-bold">General Disclaimer</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Property values, financial returns, and project completion timelines mentioned across listings or articles are projections and market estimations. Past performance does not guarantee future results. Users are advised to conduct independent legal and financial due diligence before committing funds.
                </p>
              </div>

              <hr className="border-border dark:border-dark_border" />

              {/* 5. Regulatory Disclosures */}
              <div id="regulatory" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 05
                </span>
                <h2 className="text-2xl font-bold">Regulatory Disclosures</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Property-pro operates in compliance with applicable regional real estate regulatory bodies (including relevant authority frameworks in Pakistan and the UAE). All agents and advisors operate under strict adherence to local real estate licensing and statutory guidelines.
                </p>
              </div>

              <hr className="border-border dark:border-dark_border" />

              {/* 6. Accessibility */}
              <div id="accessibility" className="scroll-mt-28 space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                  Section 06
                </span>
                <h2 className="text-2xl font-bold">Accessibility Statement</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  We are committed to ensuring digital accessibility for individuals with disabilities. We continually improve the user experience for everyone, applying relevant accessibility standards across our web interfaces and property search tools.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Footer Support Banner */}
      <section className="py-16 bg-gray-50 dark:bg-semidark/30 border-t border-border dark:border-dark_border text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Have questions about our legal policies?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Our compliance team is ready to assist you with any regulatory inquiries.</p>
          <Link href="/contact" className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition">
            Contact Compliance Team
          </Link>
        </div>
      </section>
    </div>
  );
}