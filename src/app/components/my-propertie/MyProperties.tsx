"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Loader from "../shared/Loader";
import AddPropertyModal from "../property-list/search/AddPropertyModal"; // Apne modal ka path check kar lein

interface Property {
  id: string;
  property_title: string;
  price: number;
  location: string;
  image: string | null;
  status: "Active" | "Inactive" | "Sold";
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal ke open/close state

  // Database se real properties fetch karna
  const fetchProperties = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser?.id || "1";

      const res = await fetch(`/api/propertydata?userId=${userId}`);
      const result = await res.json();
      
      // Agar result array hai ya object mein data hai
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

  // Status Change API Call
  const handleStatusChange = async (id: string, newStatus: "Active" | "Inactive" | "Sold") => {
    setProperties((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, status: newStatus } : prop))
    );

    try {
      await fetch(`/api/propertydata/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete Property API Call
  const handleDelete = async (id: string) => {
    if (confirm("Aap waqai is property ko delete karna chahte hain?")) {
      setProperties((prev) => prev.filter((prop) => prop.id !== id));

      try {
        await fetch(`/api/propertydata?id=${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white">My Properties</h1>
        
        {/* Button jo modal ko open karega */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-semidark rounded-xl border border-border dark:border-dark_border">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Aapne abhi tak koi property add nahi ki.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary font-medium hover:underline"
          >
            Pehli property add karein
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-semidark border border-border dark:border-dark_border p-4 rounded-xl shadow-sm gap-4"
            >
              {/* Image & Info */}
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
                  <h3 className="text-lg font-semibold text-dark dark:text-white">
                    {property.property_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.location}</p>
                  <p className="text-primary font-bold mt-1">
                    RS {Number(property.price).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Badge & Selector */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-xs text-gray-400 mb-1">Status</span>
                  <select
                    value={property.status || "Active"}
                    onChange={(e) =>
                      handleStatusChange(property.id, e.target.value as "Active" | "Inactive" | "Sold")
                    }
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                      property.status === "Active"
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                        : property.status === "Inactive"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/edit-property/${property.id}`}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark_border text-dark dark:text-white rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit
                  </Link>
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

      {/* Add Property Modal Integration */}
      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchProperties(); // Property save hone par list dobara fetch hogi
        }}
      />
    </div>
  );
}