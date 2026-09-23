import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Off-Plan Properties | Chiron Properties",
};

export default function AboutOffPlanPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/about-off-plan", text: "About Off-Plan" },
  ];

  const benefits = [
    {
      num: "01",
      title: "Lower Entry Price",
      desc: "You can maximise your capital by buying off-plan units, which are typically priced 10–30% lower than ready-to-move-in homes."
    },
    {
      num: "02",
      title: "Flexible Payment Plans",
      desc: "Developer offers are attractive, allowing you to manage cash flow easily without getting locked into a massive mortgage."
    },
    {
      num: "03",
      title: "Modern Lifestyle Amenities",
      desc: "Get access to cutting-edge features including smart home technology, energy-efficient cooling, and advanced community facilities."
    },
    {
      num: "04",
      title: "Strong Capital Appreciation",
      desc: "The value of the property rises over time as construction progresses, making your initial purchase price a high-yielding investment."
    },
    {
      num: "05",
      title: "Brand-New Property",
      desc: "Enjoy a pristine, untouched home built with modern architectural standards instead of purchasing or maintaining an older one."
    }
  ];

  return (
    <div className="bg-white dark:bg-darkmode min-h-screen text-black dark:text-white">
      {/* Sub Header */}
      <HeroSub
        title="About Off-Plan Properties"
        description="Explore why off-plan projects account for over 60% of nationwide transactions and how you can secure high-yield assets early."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* 1. Overview & Market Share Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
                Market Insight
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 leading-tight">
                The Driving Force of Modern Real Estate Growth
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                One of the major reasons for the rapid growth of the property market is Off-plan projects, which currently account for over <span className="font-semibold text-primary">60% of all transactions nationwide</span>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We empower investors with early access to upcoming architectural masterpieces, ensuring maximum capital gains long before handover.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/properties"
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition shadow-md"
                >
                  Explore Properties
                </Link>
                <Link
                  href="/contact"
                  className="border border-border dark:border-dark_border px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-semidark transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Highlight Card for Escrow Guarantee */}
            <div className="bg-gray-50 dark:bg-semidark p-8 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                🛡️
              </div>
              <h3 className="text-2xl font-bold">100% Secure Investment</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                All your payments are secure and go into a <span className="font-semibold text-primary">RERA-regulated Escrow Account</span>, which will be accessed by the developer only once specific construction milestones are verified by regulatory authorities.
              </p>
              <div className="border-t border-border dark:border-dark_border pt-4 text-xs text-gray-500 dark:text-gray-400">
                ✓ Milestone-based releases &nbsp;|&nbsp; ✓ Complete legal compliance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. What is Off-Plan Section */}
      <section className="py-16 bg-gray-50 dark:bg-semidark/30 border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
            Definition
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">What is Off-Plan?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            In simple terms, off-plan property is when you purchase a unit — an apartment, villa, or townhouse — directly from a developer before construction is completed, based solely on assets shared by the developer that may include floor plans, architectural vision, development plan, and aesthetic presentation.
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            You first secure the property with a down payment and follow a structured payment plan until the building is handed over.
          </p>
        </div>
      </section>

      {/* 3. Why Choose Off-Plan Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
              Advantages
            </span>
            <h2 className="text-3xl font-bold mt-3 mb-3">Why Choose Off-Plan?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Off-plan purchases offer compelling advantages for investors and end-users looking to enter the property market at the right price point.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-semidark p-8 rounded-xl border border-border dark:border-dark_border shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mb-4">
                    {item.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Call to Action Banner */}
      <section className="py-16 bg-black text-white dark:bg-semidark border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ready to Invest in Off-Plan Properties?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
            Speak with our expert advisory team to find the best payment plans and high-yield upcoming projects tailored for you.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition shadow-md"
          >
            Get Expert Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}