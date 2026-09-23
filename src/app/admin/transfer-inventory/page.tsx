"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function TransferInventoryPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerAssignment, setCustomerAssignment] = useState<any>(null);
  
  // All inventories list for shifting
  const [inventories, setInventories] = useState<any[]>([]);
  const [targetInventoryId, setTargetInventoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch available inventories on load
  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      const res = await fetch("/api/transfer-inventory?fetchInventories=true");
      const data = await res.json();
      if (data.success) {
        setInventories(data.inventories || []);
      } else {
        toast.error(data.message || "Failed to load inventory list.");
      }
    } catch (error) {
      console.error("Failed to fetch inventories:", error);
      toast.error("Error connecting to server for inventory list.");
    }
  };

  // CNIC Auto-formatting function
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);

    let formattedValue = value;
    if (value.length > 5 && value.length <= 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }

    setCnicInput(formattedValue);
  };

  // 1. Search Customer by CNIC
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicInput.trim()) {
      toast.error("Please enter a valid CNIC!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/transfer-inventory?cnic=${cnicInput}`);
      const data = await res.json();
      
      if (data.success && data.assignment) {
        setCustomerAssignment(data.assignment);
        toast.success("Customer assignment found!");
      } else {
        toast.error(data.message || "No active assignment found for this CNIC.");
        setCustomerAssignment(null);
      }
    } catch (error) {
      toast.error("Error fetching customer data.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Shift / Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInventoryId) {
      toast.error("Please select a target inventory!");
      return;
    }

    if (targetInventoryId === customerAssignment.inventoryId) {
      toast.error("Customer is already assigned to this inventory!");
      return;
    }

    const targetInv = inventories.find(i => i.id === targetInventoryId);
    if (!targetInv) {
      toast.error("Selected inventory not found!");
      return;
    }

    const customerUnits = Number(customerAssignment.customerUnit || 0);
    const availableUnitsInTarget = Number(targetInv.remainingUnits ?? targetInv.totalUnits ?? 0);

    if (customerUnits > availableUnitsInTarget) {
      toast.error(`Target inventory does not have enough units! Required: ${customerUnits}, Available: ${availableUnitsInTarget}`);
      return;
    }

    try {
      setSubmitting(true);
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = loggedInUser.id || "";

      if (!userId) {
        toast.error("User session not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      const inventoryFetchedPrice = Number(targetInv.price || targetInv.totalPrice || targetInv.inventoryPrice || 0);

      const payload = {
        assignmentId: customerAssignment.assignmentId,
        newInventoryId: targetInv.id,
        newInventoryName: targetInv.property_title || targetInv.name,
        newTotalPrice: inventoryFetchedPrice,
        userId: userId,
        remarks: `Transferred customer (CNIC: ${customerAssignment.cnic}) to ${targetInv.property_title || targetInv.name}`
      };

      const res = await fetch("/api/transfer-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer inventory");

      toast.success("Customer successfully shifted and logged!");
      setCustomerAssignment(null);
      setCnicInput("");
      setTargetInventoryId("");
      fetchInventories();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInvObj = inventories.find(i => i.id === targetInventoryId);

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl">
          <h1 className="text-3xl font-extrabold text-black dark:text-white text-center">Shift Customer Inventory</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Transfer customer to a new inventory after verifying unit availability.</p>
        </div>

        {/* Search Box with Auto-formatted CNIC */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Customer CNIC</label>
              <input 
                type="text" 
                placeholder="33303-3332783-9" 
                value={cnicInput}
                onChange={handleCnicChange}
                maxLength={15}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-bold text-xs shadow transition"
            >
              {loading ? "Searching..." : "Fetch Customer"}
            </button>
          </form>
        </div>

        {/* Customer & Transfer Section */}
        {customerAssignment && (
          <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl p-6 space-y-6">
            <div className="border-b border-gray-200 dark:border-dark_border pb-4">
              <h3 className="text-sm font-black uppercase text-gray-400">Current Assignment Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                <div><span className="font-bold block text-gray-500">Customer Name:</span> <span className="text-black dark:text-white font-bold">{customerAssignment.customerName || 'N/A'}</span></div>
                <div><span className="font-bold block text-gray-500">Current Inventory:</span> <span className="text-black dark:text-white font-bold">{customerAssignment.inventoryName}</span></div>
                <div><span className="font-bold block text-gray-500">Assigned Units:</span> <span className="text-black dark:text-white font-bold">{customerAssignment.customerUnit} Units</span></div>
                <div><span className="font-bold block text-gray-500">Current Total Price:</span> <span className="text-black dark:text-white font-bold">Rs. {Number(customerAssignment.totalPrice).toLocaleString()}</span></div>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Select Target Inventory to Shift</label>
                
                <div className="relative">
                  <select 
                    value={targetInventoryId}
                    onChange={(e) => setTargetInventoryId(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold appearance-none cursor-pointer outline-none focus:border-black dark:focus:border-white"
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-darkmode">-- Choose New Inventory --</option>
                    {inventories.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-white dark:bg-darkmode text-black dark:text-white py-2">
                        {inv.property_title || inv.name} (Available Units: {inv.remainingUnits ?? inv.totalUnits ?? 'N/A'}) - Price: Rs. {Number(inv.price || inv.totalPrice || inv.inventoryPrice || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black dark:text-white">
                    ▼
                  </div>
                </div>

                {selectedInvObj && (
                  <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400">
                    Selected: {selectedInvObj.property_title || selectedInvObj.name} | Price: Rs. {Number(selectedInvObj.price || selectedInvObj.totalPrice || selectedInvObj.inventoryPrice || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-3 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-black text-xs shadow transition"
                >
                  {submitting ? "Processing Transfer..." : "Confirm & Shift Inventory"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}