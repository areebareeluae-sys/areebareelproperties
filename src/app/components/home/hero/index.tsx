"use client";
import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PropertyContext } from "@/context-api/PropertyContext";
import { Icon } from "@iconify/react";

const Hero = () => {
  const router = useRouter();
  const [propertiesData, setPropertiesData] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { updateFilter } = useContext(PropertyContext)!;
  const [activeTab, setActiveTab] = useState("buy");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [location, setLocation] = useState("");
  const [error, setError] = useState('');
  
  const [selectedCountry, setSelectedCountry] = useState("United Arab Emirates");

  // Fetch Properties & Banners Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/propertydata');
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setPropertiesData(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        if (!res.ok) throw new Error('Failed to fetch banners');
        const data = await res.json();
        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchData();
    fetchBanners();
  }, []);

  // Auto slide advertisement banners every 3 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    const storedCountry = localStorage.getItem("selected_country");
    if (storedCountry) {
      if (storedCountry.toUpperCase() === "PK") {
        setSelectedCountry("Pakistan");
      } else if (storedCountry.toUpperCase() === "UAE") {
        setSelectedCountry("United Arab Emirates");
      } else {
        setSelectedCountry(storedCountry);
      }
    }
  }, []);

  const handleSearch = () => {
    if (location.trim() === '') {
      setError('Please enter an area, community, or project.');
      return;
    }
    setError('');
    updateFilter('location', location);
    updateFilter('tag', activeTab);
    router.push(`/properties/properties-list`);
  };

  const suggestions = Array.from(new Set(propertiesData.map((item) => item.location)));

  const handleSelect = (value: any) => {
    setLocation(value);
    setShowSuggestions(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[url('/images/hero/pexels-kirandeepsingh-14330901.jpg')] dark:bg-[url('/images/hero/pexels-maria-charizani-3542905-5577693.jpg')] bg-cover bg-center bg-no-repeat overflow-x-hidden mb-8">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 -z-10" />

      <div className="container mx-auto px-4 max-w-screen-xl relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto" data-aos="fade-up">
          
          {/* ADVERTISEMENT BANNER SLIDER (Showing right above the heading text) */}
         {banners.length > 0 && (
  <div className="w-full max-w-md sm:max-w-lg h-36 sm:h-40 mb-6 relative rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black/40 backdrop-blur-sm">
    {banners.map((banner, index) => (
      <div
        key={banner.id}
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      >
        <Image
          src={banner.image}
          alt={`Ad Banner ${banner.id}`}
          fill
          className="object-cover w-full h-full"
        />
      </div>
    ))}
    {/* Optional dots indicator */}
    <div className="absolute bottom-2 right-3 z-20 flex gap-1.5">
      {banners.map((_, idx) => (
        <span
          key={idx}
          className={`h-1.5 rounded-full transition-all ${
            idx === currentBannerIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/50'
          }`}
        />
      ))}
    </div>
  </div>
)}

          {/* Heading & Subtitle */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Find Your Dream Property <br />
              <span className="text-white">in {selectedCountry}</span>
            </h1>
            <p className="text-blue-200 text-base md:text-lg font-medium">
              Luxury villas, penthouses, apartments, and more. Explore properties you can buy or invest in across {selectedCountry}.
            </p>
          </div>

          {/* Search Box Wrapper */}
          <div className="w-full max-w-3xl relative text-left">
            <div className="bg-white dark:bg-semidark rounded-xl shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
              
              {/* Tab Selector Dropdown (Buy / Rent / Offplan) */}
              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full md:w-36 bg-[#0a192f] text-white py-3.5 px-4 rounded-lg flex items-center justify-between font-semibold text-sm uppercase tracking-wider shadow-sm hover:bg-[#112240] transition-colors"
                >
                  <span>{activeTab}</span>
                  <Icon icon="solar:alt-arrow-down-linear" width="18" height="18" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-[#0a192f] border border-border/20 rounded-lg shadow-xl z-30 overflow-hidden flex flex-col">
                    {['buy', 'rent', 'offplan'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setShowDropdown(false);
                          setError('');
                        }}
                        className={`text-left py-3 px-4 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors ${activeTab === tab ? 'bg-white/15' : ''}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input Field */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search area, community or project..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full py-3.5 pl-4 pr-12 rounded-lg text-midnight_text dark:text-white bg-transparent border border-border dark:border-dark_border focus:outline-none focus:border-primary text-sm"
                />
                
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <Icon icon="solar:magnifer-linear" width="20" height="20" />
                </button>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-semidark border border-border rounded-lg z-30 max-h-48 overflow-y-auto shadow-xl text-left">
                    <ul className="py-2">
                      {suggestions
                        .filter((item: any) => item && item.toLowerCase().includes(location.toLowerCase()))
                        .map((item, index) => (
                          <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="cursor-pointer px-4 py-2 text-sm text-midnight_text dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border transition-colors"
                          >
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-xs mt-2 font-medium bg-black/50 px-3 py-1 rounded-md inline-block text-center">{error}</p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;