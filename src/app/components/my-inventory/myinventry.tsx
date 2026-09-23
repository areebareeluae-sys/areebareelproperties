"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Loader from "../shared/Loader";
import AddInventoryModal from "../inventory-list/search/AddInventoryModal";

interface InventoryItem {
    id: string;
    userId: string;
    image: string;
    images?: string[];
    property_title: string;
    price: string;
    country: string;
    currency: string;
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
    sqrft: number;
    garages: number;
    region: string;
    name: string;
    slug: string;
}

export default function MyInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Filter states
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory`);
      const result = await res.json();
      
      const inventoryList = Array.isArray(result) ? result : result.data;
      if (inventoryList) {
        setInventory(inventoryList);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Aap waqai is inventory item ko delete karna chahte hain?")) {
      setInventory((prev) => prev.filter((item) => item.id !== id));

      try {
        await fetch(`/api/inventory/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting inventory item:", error);
      }
    }
  };

  // Filtering logic
  const filteredInventory = inventory.filter((item) => {
    const matchesTitle = titleFilter === "" || item.property_title?.toLowerCase().includes(titleFilter.toLowerCase());
    const matchesLocation = locationFilter === "" || item.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = priceFilter === "" || item.price?.toString().includes(priceFilter);
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

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
    <div className="container mx-auto px-4 py-28 max-w-6xl space-y-6">
      
      {/* Centered Heading */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          My Inventory
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your property and inventory items efficiently
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div></div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-sm font-medium text-sm"
        >
          + Add New Item
        </button>
      </div>

      {/* Input Filters (Waisa hi purana original style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white dark:bg-semidark p-4 rounded-xl border border-border dark:border-dark_border shadow-xs">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Name</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Location / Warehouse</label>
          <input
            type="text"
            placeholder="Search by location..."
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
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-semidark rounded-xl border border-border dark:border-dark_border">
          <p className="text-gray-500 dark:text-gray-400 mb-4">no record found</p>
          {inventory.length === 0 && (
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="text-primary font-medium hover:underline"
            >
              Add new item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredInventory.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-semidark border border-border dark:border-dark_border p-4 rounded-xl shadow-sm gap-4"
            >
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative w-28 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.property_title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                      {item.category}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-dark_border text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {item.property_title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.location}, {item.country}
                  </p>
                  
                  <p className="text-primary font-bold mt-1.5">
                    {item.currency || "PKR"} {Number(item.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-start md:items-end">
                  <span className="text-xs text-gray-400 mb-1">Status</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                        : item.status === "Inactive"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {item.status || "Active"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark_border text-black dark:text-white rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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

      <AddInventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        inventoryData={editingItem}
        onSuccess={() => {
          fetchInventory();
        }}
      />
    </div>
  );
}