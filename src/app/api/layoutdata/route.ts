import { NextResponse } from "next/server";

const headerData = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties/properties-list" },
  { label: "Services", href: "/services" },
  { label: "Insights", href: "/insights" },
   { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Legal", href: "/legal" },
];

export const GET = async () => {
  return NextResponse.json({
    headerData
  });
};