import React from "react";
import Image from "next/image";
import "../../../style/index.css";
import Link from "next/link";

export default function History() {
  return (
    <section className="history-bg">
      <div className="container lg:max-w-screen-xl md:max-w-screen-md dark:text-black mx-auto grid grid-cols-1 lg:grid-cols-12 py-40">
        <div
          className="col-span-1 lg:col-span-7 5xl:col-span-8 px-4"
          data-aos="fade-right"
        >
          <p className="text-4xl text-midnight_text dark:text-white mb-8 font-bold">
            Our Legacy & Journey <br />
            Building Trust in Real Estate Excellence
          </p>
          <p className="mb-8 pb-2 text-gray">
            Established with a vision to revolutionize property investment and advisory, our journey has been defined by unwavering commitment, transparent transactions, and thousands of satisfied clients who found their dream homes and high-yield investments with us.
          </p>
          <Link
            href="/properties/properties-list"
            className="text-xl px-9 py-3 border border-primary text-primary hover:text-white hover:bg-primary rounded-lg transition"
          >
            Explore Portfolio
          </Link>
        </div>
        <div
          className="hidden lg:block 5xl:col-span-4 5xl:ml-11 col-span-1 lg:col-span-5"
          data-aos="fade-left"
        >
          <div className="bg-white dark:bg-darklight dark:text-white p-6 max-w-65 border-4 border-primary rounded-2xl shadow-xl">
            <p className="mb-12 text-2xl text-midnight_text dark:text-white font-bold leading-snug">
              PREMIER REAL ESTATE PARTNER
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-black text-opacity-60 dark:text-gray text-sm font-medium">
                  Years of Excellence
                </p>
                <p className="text-[60px] leading-[1.2] -mt-1 text-midnight_text dark:text-white font-extrabold mb-1">
                  15+
                </p>
              </div>
              <div>
                <Image
                  src="/images/history/logo.svg"
                  alt="company logo"
                  width={80}
                  height={110}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}