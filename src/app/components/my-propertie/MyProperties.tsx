"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Loader from "../shared/Loader";
import AddPropertyModal from "../property-list/search/AddPropertyModal";

interface Property {
  id: string;
  property_title: string;
  price: number;
  location: string;
  image: string | null;
  status: "Active" | "Inactive" | "Sold";
  category: string;
  tag: string;
  beds: number;
  baths: number;
  garages: number;
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Alag-alag filter states
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchProperties = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser?.id || "1";

      const res = await fetch(`/api/properties?userId=${userId}`);
      const result = await res.json();
      
      const propertyList = Array.isArray(result) ? result : result.data;
      if (propertyList) {
        setProperties(propertyList);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Aap waqai is property ko delete karna chahte hain?")) {
      setProperties((prev) => prev.filter((prop) => prop.id !== id));

      try {
        await fetch(`/api/properties/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  // Alag-alag inputs par filtering logic
  const filteredProperties = properties.filter((property) => {
    const matchesTitle = titleFilter === "" || property.property_title?.toLowerCase().includes(titleFilter.toLowerCase());
    const matchesLocation = locationFilter === "" || property.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = priceFilter === "" || property.price?.toString().includes(priceFilter);
    const matchesStatus = statusFilter === "All" || property.status === statusFilter;

    return matchesTitle && matchesLocation && matchesPrice && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">My Properties</h1>
        
        {/* Button: Light mode mein dark (bg-black text-white), Dark mode mein white (dark:bg-white dark:text-black) */}
        <button
          onClick={() => {
            setEditingProperty(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm font-medium"
        >
          + Add New Property
        </button>
      </div>

      {/* Har aik ke liye Alag-Alag Input Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white dark:bg-semidark p-4 rounded-xl border border-border dark:border-dark_border shadow-xs">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Title</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Location / City</label>
          <input
            type="text"
            placeholder="Search by city/location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Price</label>
          <input
            type="text"
            placeholder="Search by price..."
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-semidark rounded-xl border border-border dark:border-dark_border">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Koi property nahi mili.</p>
          {properties.length === 0 && (
            <button
              onClick={() => {
                setEditingProperty(null);
                setIsModalOpen(true);
              }}
              className="text-primary font-medium hover:underline"
            >
              Pehli property add karein
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-semidark border border-border dark:border-dark_border p-4 rounded-xl shadow-sm gap-4"
            >
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={property.image || "/images/placeholder.jpg"}
                    alt={property.property_title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {property.property_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.location}</p>
                  <p className="text-primary font-bold mt-1">
                    RS {Number(property.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-xs text-gray-400 mb-1">Status</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      property.status === "Active"
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                        : property.status === "Inactive"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {property.status || "Active"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProperty(property);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark_border text-black dark:text-white rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition dark:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        propertyData={editingProperty}
        onSuccess={() => {
          fetchProperties();
        }}
      />
    </div>
  );
}