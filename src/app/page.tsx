import React from 'react';
import { Metadata } from "next";
import Hero from './components/home/hero';
import Calculator from './components/home/calculator';
import History from './components/home/history';
import Features from './components/shared/features';
import CompanyInfo from './components/home/info';
import DiscoverProperties from './components/home/property-option';
import Listings from './components/home/country-property-list';
import Testimonials from './components/home/testimonial';
import CountryModal from '../app/components/shared/CountryModal'; // Country popup component
import Services from './components/home/Services/page';

export const metadata: Metadata = {
  title: "chironproerties.com | Home",
};

export default function Home() {
  return (
    <main>
      <CountryModal />
      <Hero />
      <Services/>
      <Listings />
      <Calculator />
      <Features />
      <History />
      <Testimonials />
      <CompanyInfo />
    </main>
  );
}