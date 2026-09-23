import { NextResponse } from "next/server";

interface SearchOption {
    value: string;
    label: string;
    country?: string; // Country mapping ke liye
    city?: string;    // City mapping ke liye (Area ke sath)
    type?: string;    // Category mapping ke liye (Property Type ke sath) - Yeh add kiya gaya hai
    placeholder?: string;
}

interface SearchOptions {
    keywords: SearchOption[];
    country: SearchOption[];
    city: SearchOption[];
    area: SearchOption[];
    property_type: SearchOption[];
    category: SearchOption[];
    status: SearchOption[];
    beds: SearchOption[];
    baths: SearchOption[];
    garages: SearchOption[];
    [key: string]: SearchOption[];
}

const menuItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Blog", href: "/#blog" },
];

const features = [
    {
        id: 1,
        imgSrc: "/images/features/rating.svg",
        title: "Great Experience",
        description: "Letraset sheets containing Lorem Ipsum passages and more recently with desktop publishing Variou"
    },
    {
        id: 2,
        imgSrc: "/images/features/Give-Women's-Rights.svg",
        title: "Great Experience",
        description: "Letraset sheets containing Lorem Ipsum passages and more recently with desktop publishing Variou"
    },
    {
        id: 3,
        imgSrc: "/images/features/live-chat.svg",
        title: "Great Experience",
        description: "Letraset sheets containing Lorem Ipsum passages and more recently with desktop publishing Variou"
    }
];

const searchOptions: SearchOptions = {
    keywords: [
        { value: '', label: 'Keyword', placeholder: 'Keyword' },
    ],
    country: [
        { value: '', label: 'Select Country' },
        { value: 'Pakistan', label: 'Pakistan' },
        { value: 'United Arab Emirates', label: 'United Arab Emirates' },
    ],
    city: [
        { value: '', label: 'Select City' },
        // Pakistan Cities
        { value: 'Lahore', label: 'Lahore', country: 'Pakistan' },
        { value: 'Karachi', label: 'Karachi', country: 'Pakistan' },
        { value: 'Islamabad', label: 'Islamabad', country: 'Pakistan' },
        // UAE Cities
        { value: 'Sharjah', label: 'Sharjah', country: 'United Arab Emirates' },
        { value: 'Dubai', label: 'Dubai', country: 'United Arab Emirates' },
    ],
    area: [
        { value: '', label: 'Select Area' },
        // Lahore Areas
        { value: 'Gulberg', label: 'Gulberg', city: 'Lahore' },
        { value: 'DHA', label: 'DHA', city: 'Lahore' },
        { value: 'Bahria Town', label: 'Bahria Town', city: 'Lahore' },
          { value: 'Thokar Niaz Baig', label: 'Thokar Niaz Baig', city: 'Lahore' },
        // Karachi Areas
        { value: 'Clifton', label: 'Clifton', city: 'Karachi' },
        { value: 'Defence', label: 'Defence', city: 'Karachi' },
        // Islamabad Areas
        { value: 'F-7', label: 'F-7', city: 'Islamabad' },
        { value: 'E-11', label: 'E-11', city: 'Islamabad' },
        // Dubai Areas
        { value: 'Downtown Dubai', label: 'Downtown Dubai', city: 'Dubai' },
        { value: 'Dubai Marina', label: 'Dubai Marina', city: 'Dubai' },
        // Sharjah Areas
        { value: 'Al Nahda', label: 'Al Nahda', city: 'Sharjah' },
    ],
    property_type: [
        { value: '', label: 'Property Type' },
        { value: 'Residential', label: 'Residential' },
        { value: 'Commercial', label: 'Commercial' },
    ],
    category: [
        { value: '', label: 'Category', type: '' },
        { value: 'Studio apartment', label: 'Studio Apartment', type: 'Residential' },
        { value: 'villa', label: 'Villa', type: 'Residential' },
        { value: 'house', label: 'House', type: 'Residential' },
        { value: 'office', label: 'Office', type: 'Commercial' },
        { value: 'shop', label: 'Shop', type: 'Commercial' },
        { value: 'warehouse', label: 'Warehouse', type: 'Commercial' },
    ], // <--- Yahan comma missing tha, jo theek kar diya hai
status: [
    { value: '', label: 'Select Status' },
    { value: 'For Rent', label: 'For Rent' },
    { value: 'For Sale', label: 'For Sale' },
    { value: 'Sold Out', label: 'Sold Out' },
    { value: 'Off Plan', label: 'Off Plan' },
],
    beds: [
        { value: '', label: 'Beds' },
        { value: '0', label: '0 Beds' },
        { value: '1', label: '1 Bed' },
        { value: '2', label: '2 Beds' },
        { value: '3', label: '3 Beds' },
        { value: '4', label: '4 Beds' },
        { value: '5', label: '5 Beds' },
    ],
    baths: [
        { value: '', label: 'Baths' },
        { value: '1', label: '1 Bath' },
        { value: '2', label: '2 Baths' },
        { value: '3', label: '3+ Baths' },
    ],
    garages: [
        { value: '', label: 'Garages' },
        { value: '0', label: '0 Garages' },
        { value: '1', label: '1 Garage' },
        { value: '2', label: '2 Garages' },
    ],
};

const data = [
    {
        src: "https://svgshare.com/i/187L.svg",
        src1: "https://svgshare.com/i/183P.svg",
        alt: "Image 1",
        name: "Apartment",
        count: 35,
    },
    {
        src: "https://svgshare.com/i/188i.svg",
        src1: "https://svgshare.com/i/185B.svg",
        alt: "Image 2",
        name: "Villa",
        count: 15,
    },
    {
        src: "https://svgshare.com/i/186r.svg",
        src1: "https://svgshare.com/i/185n.svg",
        alt: "Image 3",
        name: "Office",
        count: 26,
    },
    {
        src: "https://svgshare.com/i/187Z.svg",
        src1: "https://svgshare.com/i/184b.svg",
        alt: "Image 4",
        name: "Shop",
        count: 43,
    },
    {
        src: "https://svgshare.com/i/1881.svg",
        src1: "https://svgshare.com/i/183k.svg",
        alt: "Image 5",
        name: "House",
        count: 95,
    },
    {
        src: "https://svgshare.com/i/188C.svg",
        src1: "https://svgshare.com/i/184d.svg",
        alt: "Image 6",
        name: "Warehouse",
        count: 18,
    },
];

export const GET = async () => {
  return NextResponse.json({
    menuItems,
    features,
    searchOptions,
    data
  });
};