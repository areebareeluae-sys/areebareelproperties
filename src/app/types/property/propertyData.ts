export type propertyData = {
    id: string;
    userId: string;
    image: string;
    images?: string[];         // Multiple images / album array
    property_title: string;
    price: string | number;
    area_size?: string;        // Sq Ft ke liye naya field
    property_type?: string;    // Residential ya Commercial
    country: string;           // Country
    city?: string;             // City (Lahore, Dubai, etc.)
    area?: string;             // Area (Gulberg III, Downtown, etc.)
    currency: string;          // Currency (PKR ya AED)
    category: string;
    category_img?: string;
    rooms?: number;
    baths: number;
    location: string;          // Full formatted location
    livingArea?: string;
    tag: string;               // For Sale, For Rent, Off Plan
    check?: boolean;
    status: string;
    type?: string;
    beds: number;
    garages: number;
    region?: string;
    name?: string;
    slug: string;
};