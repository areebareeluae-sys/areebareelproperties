import Image from "next/image";
import React from "react";
import Link from "next/link";

import { propertyData } from "@/app/types/property/propertyData";

interface PropertyCardProps {
  property: propertyData & {
    country?: string;
    currency?: string;
    status?: string;
    city?: string;
    area?: string;
    area_size?: string | null;
  };
  viewMode?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode }) => {  
  // Check karna ke property Commercial hai ya Residential
  const isCommercial = property.property_type?.toLowerCase() === "commercial";

  return (
    <div
      key={property.id}
      className={`bg-white shadow-property dark:bg-darklight rounded-lg overflow-hidden relative flex flex-col h-full`}
      data-aos="fade-up"
    >
      <Link href={`/properties/properties-list/${property.slug}`} className={`group flex flex-col h-full ${viewMode=="list" && 'md:flex-row'}`}>
        <div className={`relative ${viewMode=="list" && 'md:w-[30%]'}`}>
          <div className={`imageContainer h-[250px] w-full ${viewMode =="list" && 'h-full md:h-52'}`}>
            <Image
              src={property.image || "/uploads/1788676552109-Screenshot_2025-07-07_010304.png"}
              alt={`Image of ${property.property_title}`}
              width={400}
              height={250}
              className="w-full h-full object-cover group-hover:scale-125 duration-500"
            />
          </div>
          
          {/* Tag (e.g., For Sale, Off Plan) */}
          <p className="absolute top-[10px] left-[10px] py-1 px-4 bg-white rounded-md text-primary items-center z-10 text-xs font-semibold shadow-sm">
            {property.tag}
          </p>

          {/* Status Badge */}
          {property.status && (
            <span className="absolute bottom-[10px] left-[10px] py-1 px-3 bg-primary text-white text-xs rounded-md font-semibold z-10 shadow-sm">
              {property.status}
            </span>
          )}

          {/* Favorite SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-[10px] right-[10px] bg-white p-2 rounded-lg z-10 shadow-md"
            viewBox="0 0 24 24"
            width="38"
            height="38"
            fill="#2F73F2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        
        <div className={`p-5 sm:p-6 dark:text-white flex-1 flex flex-col justify-between ${viewMode=="list" && 'md:w-[70%]'}`}>
          <div>
            {/* Title & Location Info */}
            <div className="mb-4">
              {/* Category & Type Badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-primary font-semibold px-2 py-0.5 rounded uppercase">
                  {property.property_type} {property.category ? `• ${property.category}` : ""}
                </span>
              </div>

              <h3 className="text-base font-semibold text-midnight_text dark:text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {property.property_title}
              </h3>
              
              {/* Country, City, Area formatting */}
              {(property.country || property.city || property.area) && (
                <p className="text-xs text-primary font-medium">
                  {[property.area, property.city, property.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            {/* Price & Area Size Section */}
            <div className="flex flex-col gap-2 pb-4 mb-4 border-b border-border dark:border-dark_border">
              <div className="font-bold text-lg text-primary">
                {property.currency || "PKR"} {Number(property.price).toLocaleString()}
              </div>
             
              {property.area_size && (
                <div className="text-xs bg-[#DAE7FF] dark:bg-zinc-800 text-midnight_text dark:text-white py-1 px-2.5 rounded-md font-medium w-fit max-w-full truncate">
                  📐 Area Size: {property.area_size} sqft
                </div>
              )}
            </div>
          </div>

          {/* Conditional Footer: Residential vs Commercial */}
          {!isCommercial ? (
            /* Residential Footer (Beds, Baths, Garages) */
            <div className="flex gap-2 flex-wrap justify-between pt-1">
              <div className="flex flex-col">
                <p className="md:text-xl text-lg font-bold flex gap-2 items-center text-midnight_text dark:text-white">
                  <Image
                    src="/images/svgs/icon-bed.svg"
                    alt="Bedrooms Icon"
                    height={18}
                    width={18}
                    style={{ width: "auto", height: "auto" }}
                  />
                  {property.beds}
                </p>
                <p className="text-sm text-gray">Bedrooms</p>
              </div>
              <div className="flex flex-col">
                <p className="md:text-xl text-lg font-bold flex gap-2 items-center text-midnight_text dark:text-white">
                  <Image
                    src="/images/svgs/icon-tub.svg"
                    alt="Bathrooms Icon"
                    height={18}
                    width={18}
                    style={{ width: "auto", height: "auto" }}
                  />
                  {property.baths}
                </p>
                <p className="text-sm text-gray">Bathroom</p>
              </div>
              <div className="flex flex-col">
                <p className="md:text-xl text-lg font-bold flex gap-2 items-center text-midnight_text dark:text-white">
                  <Image
                    src="/images/svgs/icon-layout.svg"
                    alt="Living Area Icon"
                    height={18}
                    width={18}
                    style={{ width: "auto", height: "auto" }}
                  />
                  {property.garages}
                </p>
                <p className="text-sm text-gray">Garages</p>
              </div>
            </div>
          ) : (
            /* Commercial Footer (Alternative details or clean spacing if beds/baths are not needed) */
            <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>Commercial Listing</span>
              <span className="text-primary font-semibold">Type: {property.property_type}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;