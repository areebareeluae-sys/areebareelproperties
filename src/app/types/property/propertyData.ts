export type propertyData = {
    id: string;
    userId: string;
    image: string;
    images?: string[];     // Multiple images / album array ke liye naya field
    property_title: string;
    price: string;
    country: string;   // Country save karne ke liye
    currency: string;  // Currency (PKR ya AED) save karne ke liye
    category: string;
    category_img: string;
    rooms: number;
    baths: number;
    location: string;
    livingArea: string;
    tag: string;
    check: boolean;
    status: string;
    type: string;
    beds: number;
    garages: number;
    region: string;
    name: string;
    slug: string;
};