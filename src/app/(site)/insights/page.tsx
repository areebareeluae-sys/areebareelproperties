import React from "react";
import { Metadata } from "next";
import HeroSub from "@/app/components/shared/hero-sub";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights & Market Reports | Property-pro",
};

export default function InsightsPage() {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/insights", text: "Insights" },
  ];

  const articles = [
    {
      id: "market-update-2026",
      category: "Market Updates",
      title: "Real Estate Market Trends & Growth Corridors for 2026",
      excerpt: "An in-depth analysis of shifting capital flows, high-yield off-plan developments, and emerging hotspots across Pakistan and the UAE.",
      date: "September 05, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "buying-guide-first-time",
      category: "Buying Guides",
      title: "The Ultimate First-Time Property Buyer's Checklist",
      excerpt: "Everything you need to know about legal verification, title deeds, mortgage options, and avoiding hidden fees before closing.",
      date: "August 28, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "area-guide-dubai-vs-lahore",
      category: "Area Guides",
      title: "Comparative Analysis: Investing in Dubai vs. Lahore Real Estate",
      excerpt: "Evaluating rental yields, appreciation rates, regulatory environments, and entry barriers for international investors.",
      date: "August 15, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "annual-q2-report",
      category: "Reports",
      title: "Q2 2026 Commercial & Residential Sector Performance Report",
      excerpt: "Comprehensive data reports breaking down supply-demand dynamics, price per square foot indices, and rental indexes.",
      date: "July 30, 2026",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "journal-sustainable-homes",
      category: "Journal",
      title: "The Rise of Eco-Friendly and Solar-Powered Smart Homes",
      excerpt: "How modern architectural design and energy-efficient systems are reshaping residential property valuations worldwide.",
      date: "July 14, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "investment-advisory-offplan",
      category: "Advisory",
      title: "Why Off-Plan Properties Offer Superior Capital Appreciation",
      excerpt: "Understanding payment plans, developer escrow accounts, and strategies to secure maximum returns before project handover.",
      date: "June 22, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="bg-white dark:bg-darkmode min-h-screen text-black dark:text-white">
      {/* Sub Header */}
      <HeroSub
        title="Insights & Journal"
        description="Expert market analysis, comprehensive buying guides, and quarterly real estate performance reports."
        breadcrumbLinks={breadcrumbLinks}
      />

      {/* Categories Filter Bar */}
      <section className="py-8 border-b border-border dark:border-dark_border bg-gray-50 dark:bg-semidark/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold">
            {["All Insights", "Market Updates", "Buying Guides", "Area Guides", "Reports", "Journal"].map((cat, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-lg transition ${
                  idx === 0
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-semidark text-gray-600 dark:text-gray-300 border border-border dark:border-dark_border hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Articles Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item) => (
              <article
                key={item.id}
                className="bg-white dark:bg-semidark rounded-2xl overflow-hidden border border-border dark:border-dark_border shadow-xs hover:border-primary/50 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-black/70 text-white px-3 py-1 rounded-full backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{item.date}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-primary transition">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-border dark:border-dark_border mt-auto">
                  <Link
                    href={`/insights/${item.id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    Read Full Article &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Banner */}
      <section className="py-20 bg-black text-white dark:bg-semidark border-t border-border dark:border-dark_border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/20 px-3 py-1 rounded-md">
            Stay Updated
          </span>
          <h2 className="text-3xl font-bold mt-4 mb-4">Get Real Estate Market Intelligence in Your Inbox</h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Subscribe to our weekly dispatch for exclusive off-plan opportunities, price trend reports, and strategic investment guidance.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-white/10 border border-border dark:border-dark_border text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary flex-1 placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition shadow-md whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}