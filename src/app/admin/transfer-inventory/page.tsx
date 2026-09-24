"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function TransferInventoryPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerAssignments, setCustomerAssignments] = useState<any[]>([]);
  
  // All inventories list for shifting
  const [inventories, setInventories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Modal / Input states for individual transfer action
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [targetInventoryId, setTargetInventoryId] = useState("");
  const [transferUnits, setTransferUnits] = useState<number | "">("");
  const [customerPin, setCustomerPin] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      
      if (data.success && data.assignments && data.assignments.length > 0) {
        setCustomerAssignments(data.assignments);
        toast.success("Customer assignments found!");
      } else {
        toast.error(data.message || "No active assignments found for this CNIC.");
        setCustomerAssignments([]);
      }
    } catch (error) {
      toast.error("Error fetching customer data.");
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setTargetInventoryId("");
    setTransferUnits(assignment.customerUnit); // Default to all units, can be changed
    setCustomerPin("");
    setShowModal(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInventoryId) {
      toast.error("Please select a target inventory!");
      return;
    }
    if (!transferUnits || Number(transferUnits) <= 0) {
      toast.error("Please enter valid units to transfer!");
      return;
    }
    if (!customerPin) {
      toast.error("Customer PIN is required for verification!");
      return;
    }

    if (targetInventoryId === selectedAssignment.inventoryId) {
      toast.error("Customer is already assigned to this inventory!");
      return;
    }

    if (Number(transferUnits) > Number(selectedAssignment.customerUnit)) {
      toast.error(`You cannot transfer ${transferUnits} units. Customer only has ${selectedAssignment.customerUnit} units here!`);
      return;
    }

    const targetInv = inventories.find(i => i.id === targetInventoryId);
    if (!targetInv) {
      toast.error("Selected inventory not found!");
      return;
    }

    const availableUnitsInTarget = Number(targetInv.remainingUnits ?? 0);
    if (Number(transferUnits) > availableUnitsInTarget) {
      toast.error(`Target inventory does not have enough units! Required: ${transferUnits}, Available: ${availableUnitsInTarget}`);
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

      const payload = {
        assignmentId: selectedAssignment.assignmentId,
        newInventoryId: targetInv.id,
        transferUnits: Number(transferUnits),
        pin: customerPin,
        userId: userId,
        remarks: `Transferred ${transferUnits} units for CNIC: ${selectedAssignment.cnic} from ${selectedAssignment.inventoryName} to ${targetInv.property_title}`
      };

      const res = await fetch("/api/transfer-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer inventory");

      toast.success("Customer units successfully transferred!");
      setShowModal(false);
      setCustomerAssignments([]);
      setCnicInput("");
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
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-black dark:text-white text-center">Shift Customer Inventory</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Search customer by CNIC, check active rows in grid, and transfer units with PIN verification.</p>
        </div>

        {/* Search Box */}
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

        {/* Grid Results Section */}
        {customerAssignments.length > 0 && (
          <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase text-gray-400 border-b border-gray-200 dark:border-dark_border pb-3">Active Assignments Grid</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark_border text-gray-400 font-bold uppercase">
                    <th className="py-3 px-3">Customer CNIC</th>
                    <th className="py-3 px-3">Property Name</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Units</th>
                    <th className="py-3 px-3">Units Price</th>
                    <th className="py-3 px-3">Invenory Price</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark_border text-black dark:text-white font-medium">
                  {customerAssignments.map((item) => (
                    <tr key={item.assignmentId} className="hover:bg-gray-50 dark:hover:bg-darkmode/50">
                      <td className="py-4 px-3 font-bold">{item.cnic || 'N/A'}</td>
                      <td className="py-4 px-3">{item.inventoryName}</td>
                      <td className="py-4 px-3"><span className="px-2 py-1 bg-gray-100 dark:bg-dark_border rounded text-[10px] font-bold">{item.plan}</span></td>
                      <td className="py-4 px-3 font-bold">{item.customerUnit} Units</td>
                      <td className="py-4 px-3 font-bold">RS:{(item.customerUnit * 100000).toLocaleString()} </td>
                      <td className="py-4 px-3">Rs. {Number(item.totalPrice).toLocaleString()}</td>
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => openTransferModal(item)}
                          className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg font-bold text-[11px] shadow hover:opacity-80 transition"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showModal && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-semidark w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-dark_border pb-3">
                <h3 className="text-base font-extrabold text-black dark:text-white">Transfer Property Units</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg">✕</button>
              </div>

              <div className="text-xs space-y-1 bg-gray-50 dark:bg-darkmode p-3 rounded-xl border border-gray-200 dark:border-dark_border">
                <p><span className="text-gray-400 font-bold">Current Property:</span> <span className="font-bold text-black dark:text-white">{selectedAssignment.inventoryName}</span></p>
                <p><span className="text-gray-400 font-bold">Owned Units:</span> <span className="font-bold text-black dark:text-white">{selectedAssignment.customerUnit} Units</span></p>
                <p><span className="text-gray-400 font-bold">Active Plan:</span> <span className="font-bold text-black dark:text-white">{selectedAssignment.plan}</span></p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Select Target Inventory</label>
                  <select 
                    value={targetInventoryId}
                    onChange={(e) => setTargetInventoryId(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold appearance-none cursor-pointer outline-none focus:border-black dark:focus:border-white"
                    required
                  >
                    <option value="" disabled className="bg-white dark:bg-darkmode">-- Choose New Inventory --</option>
                    {inventories.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-white dark:bg-darkmode text-black dark:text-white py-2">
                        {inv.property_title} (Available: {inv.remainingUnits} / Total: {inv.totalUnits})
                      </option>
                    ))}
                  </select>
                  {selectedInvObj && (
                    <p className="mt-1 text-[11px] font-bold text-green-600 dark:text-green-400">
                      Available Units in Target: {selectedInvObj.remainingUnits}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Units to Transfer</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedAssignment.customerUnit}
                    value={transferUnits}
                    onChange={(e) => setTransferUnits(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">You can transfer up to {selectedAssignment.customerUnit} units.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Customer Security PIN Verification</label>
                  <input 
                    type="password" 
                    placeholder="Enter Customer 4-digit PIN"
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-dark_border text-black dark:text-white rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2.5 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-black text-xs shadow transition"
                  >
                    {submitting ? "Verifying & Transferring..." : "Confirm Transfer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}