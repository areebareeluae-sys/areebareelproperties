'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import HeroSub from "@/app/components/shared/hero-sub";
import Image from 'next/image';
export default function HissaDetailsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            q: "1. What is HISSA (DLSW)?",
            a: "HISSA (DLSW) is a property-based participation and income program by Areeb Areel Corporation for eligible Widows, Seniors aged 65+, Low-Income individuals or families, and Persons with Disabilities. It allows an eligible participant with limited capital to participate in an identified property-linked arrangement without purchasing an entire property."
        },
        {
            q: "2. Why was HISSA (DLSW) created?",
            a: "The program is intended to give eligible people with limited savings a structured opportunity to receive a property-linked monthly benefit. It is designed around participation with dignity rather than charity."
        },
        {
            q: "3. Is HISSA a charity or financial assistance?",
            a: "No. HISSA is not presented as charity. An eligible participant contributes a defined participation amount and receives the contractual financial benefit attached to the selected option and identified property arrangement."
        },
        {
            q: "4. Who can apply?",
            a: "The program is primarily intended for Widows (W), Seniors aged 65+ (S), Low-Income individuals/families (L), and Persons with Disabilities (D). The current personal monthly income criterion is PKR 50,000 or less, subject to verification and the final program rules."
        },
        {
            q: "5. How is eligibility verified?",
            a: "The Company may request reasonable documentary evidence to confirm the applicant's W/S/L/D category, identity and income eligibility. Materially false information may lead to rejection or termination in accordance with the final agreement and applicable law."
        },
        {
            q: "6. How much can I participate with?",
            a: "Participation is structured in units of PKR 100,000. The current minimum participation is PKR 200,000 and the maximum is PKR 2,000,000 per participant, subject to the final program rules and applicable law."
        },
        {
            q: "7. What are the income options?",
            a: "Option A - Higher Monthly Income: PKR 2,200 per month for every PKR 100,000 unit (2.2% per month; 26.4% over 12 months on a simple, non-compounded basis), with no capital gain. Option B - Monthly Income + Capital Gain: PKR 800 per month for every PKR 100,000 unit (0.8% per month), plus the applicable capital gain after five years according to the executed capital-gain schedule."
        },
        {
            q: "8. Why is the monthly income under Option A higher than many conventional saving options?",
            a: "HISSA has a defined social purpose and is structured to share a larger monthly benefit with eligible participants. Under Option A, PKR 2,200 per month per PKR 100,000 equals 2.2% per month, or 26.4% over 12 months on a simple, non-compounded basis. The final legal, tax and regulatory structure must govern how the program is offered and operated."
        },
        {
            q: "9. Does Option A include capital gain?",
            a: "No. Option A is designed for the higher monthly benefit and does not include capital gain."
        },
        {
            q: "10. How does Option B capital gain work?",
            a: "Option B includes the lower monthly benefit plus the applicable capital gain after five years. The executed Schedule B must state the starting value, valuation methodology, ending valuation methodology, participant's applicable economic proportion, valuation date, permitted adjustments or deductions, calculation formula and settlement process. No verbal promise should replace that written schedule."
        },
        {
            q: "11. Is future property appreciation guaranteed?",
            a: "No. Property values can rise, remain stable or decline. Future appreciation is not guaranteed. Any Option B capital-gain entitlement must be calculated under the agreed written methodology and the actual applicable valuation outcome."
        },
        {
            q: "12. What property is my participation linked to?",
            a: "The participant's interest relates only to the property or project identified in the executed Property Schedule. That schedule should identify the property, address, type, relevant shop/floor/unit or allocation, title holder, valuation reference and other material property-specific information."
        },
        {
            q: "13. Do I become the owner or manager of the property?",
            a: "Participation does not by itself give the participant management, operational, possession, tenancy-control, structural, development, voting or decision-making rights. The participant receives only the contractual financial rights expressly stated in the agreement and executed schedules, unless a schedule expressly and legally provides otherwise."
        },
        {
            q: "14. Who manages tenants, rent, maintenance and vacancies?",
            a: "Management and operational authority remains with the Company and/or lawful Property Owner, as applicable. This includes tenant selection, leasing, rent negotiations, tenant replacement, renewals, vacancy management, repairs, maintenance, security, utilities, marketing and other operational decisions."
        },
        {
            q: "15. Do I have to find tenants or collect rent?",
            a: "No. The participant is not responsible for finding tenants, negotiating with them, collecting rent directly, managing vacancies or carrying out maintenance. The participant's payment entitlement is governed by the selected option and the agreement."
        },
        {
            q: "16. Can I contact a tenant and demand my share of rent directly?",
            a: "No. A participant cannot demand payment directly from a tenant merely because the participant receives a rental-linked benefit under HISSA. Tenant relationships remain under the designated management structure."
        },
        {
            q: "17. Can I occupy, alter or renovate the property?",
            a: "Not unless the executed Property Schedule expressly and legally provides otherwise. A participant may not take possession, appoint or remove tenants, alter or renovate the premises, change use, partition the property, undertake construction or interfere with management."
        },
        {
            q: "18. Are roof, rooftop, air, signage, solar or future development rights included?",
            a: "Not automatically. Unless expressly and legally transferred in the Property Schedule, rooftop ownership/use, future construction, additional-floor rights, air rights, advertising/signage, telecommunications, solar installation and residual development rights remain with the lawful Landowner/Company identified in the applicable title and schedule."
        },
        {
            q: "19. Am I locked in for five years?",
            a: "No. The five-year period relates to the Option B capital-gain structure. The agreement provides a separate exit mechanism after the initial minimum participation period."
        },
        {
            q: "20. What is the initial minimum participation period?",
            a: "The current agreement provides an initial minimum participation period of six months. Ordinary withdrawal is not available during that period unless the agreement expressly provides otherwise or an exceptional case is approved consistently with applicable law."
        },
        {
            q: "21. Can I exit after six months?",
            a: "Yes. After completing the initial six-month period, the participant may request complete withdrawal by giving two months' prior written notice, subject to the executed exit and settlement terms."
        },
        {
            q: "22. Exactly when will my capital be repaid after an exit?",
            a: "The exact settlement deadline must be stated in the executed Schedule C before participation. The current agreement draft deliberately leaves this item to be finalized rather than making a verbal or undocumented promise."
        },
        {
            q: "23. What happens to monthly payments when I exit?",
            a: "The executed exit schedule must state how accrued monthly payments are treated, together with the capital repayment mechanism, applicable taxes, permitted deductions, payment method and settlement deadline."
        },
        {
            q: "24. What happens to Option B capital gain if I exit before five years?",
            a: "The treatment of Option B capital gain on early exit must be stated in the executed Schedule C. The current agreement draft does not assign an undisclosed or automatic outcome."
        },
        {
            q: "25. Can I change from Option B to Option A if I later need more monthly income?",
            a: "Subject to the written program terms, yes. For applicable completed months before conversion, the difference between PKR 2,200 and PKR 800 - PKR 1,400 per month per PKR 100,000 unit - is to be calculated and paid or adjusted according to the written conversion rules. The treatment of any Option B capital-gain entitlement following conversion must be stated in Schedule C."
        },
        {
            q: "26. Is my original capital guaranteed or '100% safe'?",
            a: "The agreement does not use an unconditional guarantee of investment safety. Original capital is to be handled strictly under the written exit and settlement provisions. The repayment mechanism must be disclosed before participation, and property-related arrangements can involve market, regulatory, tax, operational, cost, delay and other risks."
        },
        {
            q: "27. What records will I receive?",
            a: "The Company is to maintain appropriate records of the participation amount, allocated units, selected option, monthly benefits, conversions, exit notices, settlements and material amendments, and provide appropriate documentary confirmation."
        },
        {
            q: "28. When are monthly payments made?",
            a: "Monthly payments are to be made on or before the date stated in the Participant Schedule through the approved payment method, with an appropriate payment record maintained by the Company."
        },
        {
            q: "29. Can a salesperson or dealer change the terms verbally?",
            a: "No. A salesperson, dealer, employee or representative cannot alter the agreement through a verbal promise. Any material representation affecting participation should be documented in writing."
        },
        {
            q: "30. What if a poster, video or FAQ says something different from the signed agreement?",
            a: "FAQs, posters and videos are explanatory material. The signed agreement and executed schedules govern the contractual relationship, subject to applicable law and any legally enforceable rights arising from representations."
        },
        {
            q: "31. Can the Company change my financial rights later through an announcement?",
            a: "A material amendment affecting an existing participant's contractual financial rights should not become effective merely through an informal verbal announcement. Any amendment requiring consent must be documented and accepted in the manner required by applicable law."
        },
        {
            q: "32. What happens if the property is sold, transferred or restructured?",
            a: "Subject to applicable law, title arrangements and the protections in the Property Schedule, the Company/property owner retains the management rights necessary to operate, lease, manage, restructure or otherwise administer the property. Any transaction materially affecting the participant's contractual financial entitlement must be handled under the agreement and applicable law."
        },
        {
            q: "33. What happens if the participant dies?",
            a: "A participant may record a nominee or next contact for administration and continuity, but nomination does not automatically create ownership or override inheritance or succession law. Settlement or continuation must be handled under applicable law, succession documentation and the agreement."
        },
        {
            q: "34. Are taxes or statutory deductions applicable?",
            a: "Any applicable withholding tax, income tax, property-related tax, statutory levy or legally required deduction must be handled according to applicable Pakistani law. Neither party is required to violate tax or regulatory obligations in order to preserve a stated payment amount."
        },
        {
            q: "35. What risks should I understand before joining?",
            a: "Property-related arrangements may involve market, regulatory, tax, tenant, operational, cost, delay and other risks. Participants should understand the property, selected option, capital-gain rules, conversion rights, initial six-month period, exit notice, settlement process, management restrictions and other contractual obligations before joining."
        },
        {
            q: "36. How are complaints handled?",
            a: "Participant complaints should first be submitted to the Areeb Areel Corporation - HISSA (DLSW) Department. The final legally reviewed agreement should specify the escalation and dispute-resolution process without unlawfully restricting statutory rights or access to a competent regulator or court."
        },
        {
            q: "37. Which law applies?",
            a: "The agreement states that it is to be governed by the applicable laws of the Islamic Republic of Pakistan together with relevant provincial and local laws and regulations. Final jurisdiction and dispute-resolution language is to be inserted after legal review."
        },
        {
            q: "38. How do I apply?",
            a: "An applicant may apply through the approved online or office process. Required identity, eligibility and supporting documents should be submitted for verification before participation is accepted."
        },
        {
            q: "39. What should I understand before signing?",
            a: "Before signing, the participant should understand the identified property, participation amount, selected income option, capital-gain mechanism, conversion rights, six-month initial period, two-month exit notice, settlement and repayment mechanism, management restrictions, excluded rights, risks, taxes and contractual obligations."
        },
        {
            q: "40. What must still be finalized before this program is offered for signing?",
            a: "The current agreement is expressly a professional draft for legal review. Before execution, marketing or acceptance of participant funds, the exact capital-gain valuation formula, exact settlement deadline after exit, and the legal characterization, title/registration, tax and regulatory consequences should be confirmed through qualified Pakistani legal and tax counsel."
        },
        {
            q: "41. Still have questions?",
            a: "Please ask before signing. The purpose of the FAQ is clarity, not pressure. Call or WhatsApp the HISSA (DLSW) Department at 0348-2107363 and request that any material answer affecting your participation be confirmed in writing."
        }
    ];
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About Us" },
  ];
    const filteredFaqs = faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-12 px-4 sm:px-6 lg:px-8">
             <HeroSub
        title="HISSA (DLSW) Property Rent-Share Program"
        description="Areeb Areel Corporation — Professional Draft"
        breadcrumbLinks={breadcrumbLinks}
      />  

       <section className="py-20">
  <div className="container mx-auto px-4 max-w-6xl">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-md">
          Areeb Areel Corporation — HISSA (DLSW)
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-3 leading-tight text-midnight_text dark:text-white">
          Property Rent-Share Program with Dignity
        </h2>
        <p className="text-sm font-semibold text-gray dark:text-gray-505 mb-6">
          PEOPLE | PROPERTY | PROGRESS | AAC-HISSA-DLSW-FAQ
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm">
          HISSA (DLSW) is a specialized property-based participation and income program designed for eligible <strong>Widows (W), Seniors aged 65+ (S), Low-Income individuals or families (L), and Persons with Disabilities (D)</strong>. It allows participants with limited capital to benefit from property-linked arrangements without needing to purchase an entire property.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm">
          Built around participation with dignity rather than charity, the program offers flexible structures—such as Option A for higher monthly benefits or Option B combining monthly returns with 5-year capital appreciation.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/hissa"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-200 text-sm"
          >
            <Icon icon="fluent:form-24-regular" width="20" height="20" />
            Eligibility Form
          </Link>
          
        </div>

        {/* Program Key Metrics / Units */}
        <div className="grid grid-cols-3 gap-4 dark:border-dark_border p-2 pt-4 border-t border-border">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-primary mb-1">PKR 100K</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Per Participation Unit</p>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-primary mb-1">2.2%</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Opt A Monthly Benefit</p>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-primary mb-1">6 Months</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Min. Participation Period</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative w-full h-[450px]   dark:border-dark_border bg-gray-100 dark:bg-semidark">
          <Image
            src="/images/logo/hissa.png" 
            alt="HISSA DLSW Property Program"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</section>
            <div className="max-w-4xl mx-auto">

                {/* Important Status Notice */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
                    <div className="flex items-start gap-3">
                        <Icon icon="solar:info-circle-bold" className="text-amber-500 flex-shrink-0 mt-0.5" width="22" height="22" />
                        <div>
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Important Status Notice</h3>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                                This FAQ has been rebuilt from the current HISSA (DLSW) FAQ and the uploaded Property Participation & Income Agreement. It is an explanatory draft and does not replace the signed agreement or executed schedules. The agreement itself states that the legal, tax and regulatory structure must be reviewed before execution, marketing or acceptance of participant funds.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-semidark p-4 rounded-xl shadow-sm border border-border dark:border-dark_border flex items-center gap-3">
                    <Icon icon="solar:magnifer-linear" className="text-gray" width="20" height="20" />
                    <input 
                        type="text" 
                        placeholder="Search questions or keywords (e.g., Option A, Exit, 6 months)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-sm text-midnight_text dark:text-white focus:outline-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-xs text-gray hover:text-primary">Clear</button>
                    )}
                </div>

                {/* FAQs List Section */}
                <div className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 sm:p-10 border border-border dark:border-dark_border space-y-6">
                    <div className="border-b border-border dark:border-dark_border pb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-midnight_text dark:text-white">Frequently Asked Questions</h2>
                            <p className="text-xs text-gray dark:text-gray-505 mt-0.5">Clear answers before participation.</p>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-darkmode px-3 py-1 rounded-full text-gray">
                            Showing {filteredFaqs.length} of {faqs.length}
                        </span>
                    </div>

                    <div className="space-y-6 divide-y divide-border/50 dark:divide-dark_border/50">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, idx) => (
                                <div key={idx} className="pt-6 first:pt-0 space-y-2">
                                    <h3 className="text-base font-semibold text-midnight_text dark:text-white flex items-start gap-2">
                                        {faq.q}
                                    </h3>
                                    <p className="text-sm text-gray dark:text-gray-505 pl-4 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray">
                                <p>No matching questions found for "{searchQuery}".</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Support Section */}
                <div className="bg-white dark:bg-semidark shadow-xl rounded-2xl p-6 border border-border dark:border-dark_border text-center space-y-3">
                    <h3 className="text-lg font-bold text-midnight_text dark:text-white">Still have questions?</h3>
                    <p className="text-xs text-gray dark:text-gray-505">
                        Please ask before signing. The purpose of the FAQ is clarity, not pressure.
                    </p>
                    <div className="pt-2">
                        <a 
                            href="tel:03482107363" 
                            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition-colors shadow-md"
                        >
                            <Icon icon="solar:phone-calling-bold" width="18" height="18" />
                            Call / WhatsApp: 0348-2107363
                        </a>
                    </div>
                </div>

            </div>
        </main>
    );
}