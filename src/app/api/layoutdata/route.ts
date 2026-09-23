import { NextResponse } from "next/server";

const headerData = [
  { label: "Buy", href: "/properties/properties-list?status=For+Sale" },
  { label: "Rent", href: "/properties/properties-list?status=For+Rent" },
  { label: "Sold", href: "/properties/properties-list?status=Sold+Out" },
  { 
    label: "Off Plan", 
    href: "/properties/properties-list?status=Off+Plan",
    children: [
      { label: "About Off Plan", href: "/about/offplan-about" },
      { label: "Off Plan Properties", href: "/properties/properties-list?status=Off+Plan" }
    ]
  },
  { label: "Commercial", href: "/properties/properties-list?listing_type=Commercial" },
  { label: "Inventory", href: "/properties/properties-list" },
  { 
    label: "Services", 
    href: "/services",
    children: [
      { label: "Property Management", href: "/services/property-management" },
      { label: "Professional Inspection", href: "/services/professional-inspection" },
      { label: "Brokerage", href: "/services/brokerage" },
      { label: "Mortgage", href: "/services/mortgage" },
      { label: "Property Listing & Marketing", href: "/services/property-listing-marketing" },
      { label: "After Sales Support", href: "/services/after-sales-support" }
    ]
  },
  { label: "Hissa", href: "/hissa-details" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const GET = async () => {
  return NextResponse.json({
    headerData
  });
};