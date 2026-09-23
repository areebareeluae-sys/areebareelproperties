"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import Image from 'next/image';
import CompanyInfo from '@/app/components/home/info';
import Tabbar from '@/app/components/property-details/tabbar';
import TextSection from '@/app/components/property-details/text-section';
import DiscoverProperties from '@/app/components/home/property-option';

export default function Details() {
  const { slug } = useParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // State for Gallery Modal (Lightbox)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/propertydata');
        if (!res.ok) throw new Error('Failed to fetch');

        const jsonRes = await res.json();
        const data = Array.isArray(jsonRes) ? jsonRes : (jsonRes.data || []);
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const item = properties.find((p) => p.slug === slug);

  // Robust parsing for images list (handling both JSON string and array)
  let imagesList: string[] = [];
  if (item) {
    if (item.images) {
      if (Array.isArray(item.images)) {
        imagesList = item.images;
      } else if (typeof item.images === 'string') {
        try {
          imagesList = JSON.parse(item.images);
        } catch (e) {
          imagesList = [item.images];
        }
      }
    }
    if (imagesList.length === 0 && item.image) {
      imagesList = [item.image];
    }
  }

  // Set default selected image when list becomes available
  useEffect(() => {
    if (imagesList.length > 0 && !selectedImage) {
      setSelectedImage(imagesList[0]);
    }
  }, [imagesList, selectedImage]);

  // Handle Next and Previous image change via hero arrows
  const handlePrevImage = () => {
    const currentIndex = imagesList.indexOf(selectedImage);
    const prevIndex = currentIndex === 0 ? imagesList.length - 1 : currentIndex - 1;
    setSelectedImage(imagesList[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = imagesList.indexOf(selectedImage);
    const nextIndex = currentIndex === imagesList.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(imagesList[nextIndex]);
  };

  // Open Gallery Modal
  const handleViewGallery = () => {
    if (imagesList.length > 0) {
      const currentIndex = imagesList.indexOf(selectedImage);
      setModalImageIndex(currentIndex !== -1 ? currentIndex : 0);
      setIsGalleryOpen(true);
    }
  };

  // Modal Gallery Navigation
  const handleModalPrev = () => {
    setModalImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleModalNext = () => {
    setModalImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return <div className="text-center py-32 text-xl font-semibold dark:text-white">Loading property details...</div>;
  }

  if (!item) {
    return <div className="text-center py-32 text-xl font-semibold dark:text-white">Property not found!</div>;
  }

  const currentImageIndex = imagesList.indexOf(selectedImage);

  // Dynamic Contact Numbers from Database (Fallback to default if not provided)
  const agentNumber = item.agent_number || '+923000000000';
  const cleanPhone = agentNumber.replace(/\D/g, ''); // Removes non-numeric characters for tel/whatsapp links

  return (
    <div className="bg-white dark:bg-darkmode w-full  relative">
      {/* Full Screen & Full Width Immersive Hero Section with Arrows */}
      <section className="relative w-full h-[100vh] min-h-[650px] flex items-center text-white overflow-hidden bg-black">
        {/* Full Screen Background Image */}
        {selectedImage && (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <Image
              src={selectedImage}
              alt={item.property_title || 'Property'}
              fill
              priority
              className="object-cover w-full h-full opacity-80"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          </div>
        )}

        {/* Navigation Arrows for Hero Image Switching */}
        {imagesList.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 cursor-pointer"
              aria-label="Previous Image"
            >
              ❮
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 cursor-pointer"
              aria-label="Next Image"
            >
              ❯
            </button>
          </>
        )}

        {/* Content Container spanning full width */}
        <div className="container mx-auto max-w-screen-2xl px-6 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Left Content: Location, Title, Mini Description, Specs & Thumbnails */}
            <div className="max-w-3xl">
              {/* 1. Location Tag */}
              <p className="text-sm font-medium tracking-wide text-gray-200 mb-2 uppercase">
                📍 {item.location || `${item.country || 'Pakistan'}`}
              </p>

              {/* 2. Property Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] font-bold mb-3 text-white">
                {item.property_title}
              </h1>

              {/* 3. Mini Description */}
              {item.mini_description && (
                <p className="text-gray-300 text-base sm:text-lg mb-4 line-clamp-2">
                  {item.mini_description}
                </p>
              )}

              {/* Category & Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-bold bg-primary text-white py-1.5 px-3 rounded uppercase tracking-wider">
                  {item.tag || 'For Sale'}
                </span>
                <span className="text-xs font-bold bg-neutral-800/80 backdrop-blur border border-neutral-600 text-white py-1.5 px-3 rounded uppercase tracking-wider">
                  {item.category || 'Category'}
                </span>
              </div>

              {/* Specs Bar (Beds, Baths, Garages, Area) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-black/70 backdrop-blur-md py-3 px-5 rounded-lg border border-white/10 w-fit mb-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <span>🛏️</span>
                  <span><strong>{item.beds}</strong> BEDS</span>
                </div>
                <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span>🛁</span>
                  <span><strong>{item.baths}</strong> BATHS</span>
                </div>
                <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span>🚗</span>
                  <span><strong>{item.garages}</strong> GARAGES</span>
                </div>
                {item.area_size && (
                  <>
                    <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <span>📐</span>
                      <span><strong>{item.area_size}</strong></span>
                    </div>
                  </>
                )}
              </div>

              {/* Album Thumbnails Slider / Grid & Counter */}
              {imagesList.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    {imagesList.slice(0, 4).map((imgUrl: string, index: number) => (
                      <div 
                        key={index} 
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === imgUrl ? 'border-primary scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Thumbnail ${index + 1}`}
                          width={150}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Counter & Fully Functional View Gallery Button */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold bg-black/60 px-2.5 py-1 rounded border border-white/10">
                      {currentImageIndex !== -1 ? currentImageIndex + 1 : 1} / {imagesList.length}
                    </span>
                    <button 
                      type="button"
                      onClick={handleViewGallery}
                      className="text-xs font-bold uppercase tracking-wider underline hover:text-primary transition-colors cursor-pointer"
                    >
                      View Gallery ({imagesList.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Price & Dynamic Action Buttons */}
            <div className="bg-neutral-900/90 backdrop-blur-md p-6 rounded-xl border border-neutral-700 shadow-2xl w-full lg:w-[350px]">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Price</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary mb-4">
                {item.currency || 'PKR'} {Number(item.price).toLocaleString()}
              </div>

              {item.agent_name && (
                <div className="text-sm text-gray-300 mb-4 pb-3 border-b border-neutral-700">
                  <span className="block text-xs text-gray-400">Agent Name</span>
                  <strong className="text-white">{item.agent_name}</strong>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <a 
                  href={`tel:${cleanPhone}`}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow cursor-pointer text-center"
                >
                  📞 Call the Agent
                </a>
                <a 
                  href={`https://wa.me/${cleanPhone}?text=Hi,%20I%20am%20interested%20in%20your%20property:%20${encodeURIComponent(item.property_title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow cursor-pointer text-center"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FULL-SCREEN LIGHTBOX GALLERY MODAL */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6">
          {/* Top Bar: Counter & Close Button */}
          <div className="flex items-center justify-between text-white container mx-auto">
            <span className="text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-md backdrop-blur">
              Photo {modalImageIndex + 1} of {imagesList.length}
            </span>
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors cursor-pointer text-lg font-bold"
              aria-label="Close Gallery"
            >
              ✕
            </button>
          </div>

          {/* Center Image Display with Arrows */}
          <div className="relative flex-1 flex items-center justify-center container mx-auto px-12 my-4">
            {imagesList.length > 1 && (
              <button 
                onClick={handleModalPrev}
                className="absolute left-0 z-10 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full backdrop-blur transition-all cursor-pointer"
              >
                ❮
              </button>
            )}

            <div className="relative w-full h-[70vh] flex items-center justify-center">
              <Image 
                src={imagesList[modalImageIndex]} 
                alt="Gallery Preview"
                fill
                className="object-contain"
              />
            </div>

            {imagesList.length > 1 && (
              <button 
                onClick={handleModalNext}
                className="absolute right-0 z-10 bg-white/10 hover:bg-white/30 text-white p-3.5 rounded-full backdrop-blur transition-all cursor-pointer"
              >
                ❯
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="container mx-auto overflow-x-auto py-2 flex items-center justify-center gap-2 max-w-4xl">
            {imagesList.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setModalImageIndex(idx)}
                className={`w-16 h-12 rounded overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${modalImageIndex === idx ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <Image src={img} alt={`thumb ${idx}`} width={80} height={60} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Description Section */}
      {item.description && (
        <section className="py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <h3 className="text-xl font-bold mb-4 text-midnight_text dark:text-white">Property Description</h3>
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {item.description}
            </div>

            {item.pin_location && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark_border">
                <h4 className="text-md font-semibold mb-3 text-midnight_text dark:text-white flex items-center gap-2">
                  🗺️ Location Map
                </h4>
                <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 dark:border-dark_border shadow-sm">
                  <iframe 
                    src={item.pin_location} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location Map"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Remaining Sections */}
      <TextSection />
      <CompanyInfo />
      <Tabbar />
      <DiscoverProperties />
    </div>
  );
}