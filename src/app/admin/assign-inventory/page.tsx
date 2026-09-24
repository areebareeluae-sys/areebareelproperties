"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../../components/shared/Loader";

export default function InventoryAssignmentPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Added loading state for submit button

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Assign States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  
  // CNIC Search & Customer Profile States
  const [cnicInput, setCnicInput] = useState("");
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  // Assign Form Data
  const [assignForm, setAssignForm] = useState({
    customerUnit: "2",
    plan: "Dual_Benefit"
  });

  // CNIC Auto-formatting function (33303-3332783-9)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);

    let formatted = "";
    if (value.length > 5) {
      formatted = value.slice(0, 5) + "-" + value.slice(5, 12);
      if (value.length > 12) {
        formatted += "-" + value.slice(12, 13);
      }
    } else {
      formatted = value;
    }

    setCnicInput(formatted);
  };

  // Fetch Inventories
  const fetchInventories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory-assign");
      const data = await res.json();
      if (data.success) {
        setInventories(data.inventories);
      }
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(inventories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInventories = inventories.slice(startIndex, startIndex + itemsPerPage);

  const openAssignModal = (inv: any) => {
    setSelectedInventory(inv);
    setCnicInput("");
    setCustomerData(null);
    setAssignForm({ customerUnit: "2", plan: "Dual_Benefit" });
    setIsModalOpen(true);
  };

  const handleVerifyCnic = async () => {
    if (!cnicInput.trim() || cnicInput.length < 15) {
      toast.error("Please enter a complete 13-digit CNIC");
      return;
    }

    try {
      setFetchingCustomer(true);
      const res = await fetch(`/api/customers/verify-cnic?cnic=${encodeURIComponent(cnicInput)}`);
      const data = await res.json();
      
      if (data.success && data.customer) {
        setCustomerData(data.customer);
        toast.success("Customer profile fetched successfully!");
      } else {
        toast.error(data.message || "Customer not found or status is not complete!");
        setCustomerData(null);
      }
    } catch (error) {
      toast.error("Error verifying CNIC");
    } finally {
      setFetchingCustomer(false);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) {
      toast.error("Please verify customer CNIC first!");
      return;
    }

    const units = Number(assignForm.customerUnit);
    if (units < 2 || units > 20) {
      toast.error("Units must be between 2 and 20!");
      return;
    }

    if (units > selectedInventory.pendingUnit) {
      toast.error("Assigned units cannot exceed pending units of this inventory!");
      return;
    }

    try {
      setSubmitting(true); // Start loading on button click
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        inventoryId: selectedInventory.id,
        cnic: customerData.cnic,
        customerUnit: units,
        plan: assignForm.plan,
        actorId: loggedInUser.id || "system_admin"
      };

      const res = await fetch("/api/inventory-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Property assigned successfully!");
      setIsModalOpen(false);
      fetchInventories();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign property");
    } finally {
      setSubmitting(false); // Stop loading regardless of success/error
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
    <div className="container mx-auto px-4 py-28 max-w-6xl space-y-6">
      <Toaster position="top-right" />
      
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          Inventory Management & Assignment
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          1 Unit = Rs. 100,000 (Min 2, Max 20 Units allowed per CNIC total)
        </p>
      </div>

      <div className="bg-white dark:bg-semidark shadow-xs rounded-xl overflow-hidden border border-border dark:border-dark_border">
        {inventories.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">
            No inventory items found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-border dark:divide-dark_border text-left text-xs">
                <thead className="bg-gray-50 dark:bg-darkmode text-black dark:text-white font-extrabold uppercase">
                  <tr>
                    <th className="px-4 py-3.5">Inventory Name</th>
                    <th className="px-4 py-3.5">Total Price</th>
                    <th className="px-4 py-3.5">Total Unit</th>
                    <th className="px-4 py-3.5">Pending Unit</th>
                    <th className="px-4 py-3.5">Assign Unit</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-dark_border font-medium text-black dark:text-white">
                  {currentInventories.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-darkmode/50 transition">
                      <td className="px-4 py-4 font-bold">{inv.inventoryName}</td>
                      <td className="px-4 py-4">Rs. {inv.totalPrice.toLocaleString()}</td>
                      <td className="px-4 py-4 font-bold">{inv.totalUnit}</td>
                      <td className="px-4 py-4 text-orange-600 dark:text-orange-400 font-bold">{inv.pendingUnit}</td>
                      <td className="px-4 py-4 text-green-600 dark:text-green-400 font-bold">{inv.assignedUnit}</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => openAssignModal(inv)}
                          disabled={inv.pendingUnit < 2}
                          className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                            inv.pendingUnit < 2 
                              ? 'bg-gray-200 dark:bg-dark_border text-gray-400 cursor-not-allowed' 
                              : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-xs'
                          }`}
                        >
                          Assign Property
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-darkmode border-t border-border dark:border-dark_border">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(startIndex + itemsPerPage, inventories.length)}</span> of <span className="font-bold">{inventories.length}</span> entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border border-border dark:border-dark_border transition ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-semidark text-gray-400' 
                        : 'bg-white dark:bg-semidark text-black dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold px-2 text-black dark:text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border border-border dark:border-dark_border transition ${
                      currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-semidark text-gray-400' 
                        : 'bg-white dark:bg-semidark text-black dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ASSIGN PROPERTY MODAL */}
      {isModalOpen && selectedInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-semidark text-black dark:text-white rounded-2xl max-w-lg w-full p-6 border border-border dark:border-dark_border shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-3">
              <h3 className="text-base font-bold text-black dark:text-white">
                Assign Property: {selectedInventory.inventoryName}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-xl font-bold text-gray-400 hover:text-black dark:hover:text-white transition"
              >
                &times;
              </button>
            </div>

            {/* CNIC Verification */}
            <div className="space-y-2 bg-gray-50 dark:bg-darkmode p-4 rounded-xl border border-border dark:border-dark_border">
              <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                Customer CNIC Verification (Status must be Complete)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="33303-3332783-9"
                  maxLength={15}
                  value={cnicInput}
                  disabled={Boolean(customerData)}
                  onChange={handleCnicChange}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border border-border dark:border-dark_border bg-white dark:bg-semidark text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${customerData ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <button 
                  type="button"
                  onClick={handleVerifyCnic}
                  disabled={fetchingCustomer || Boolean(customerData)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    customerData 
                      ? 'bg-gray-200 dark:bg-dark_border text-gray-500 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                  }`}
                >
                  {fetchingCustomer ? 'Checking...' : customerData ? 'Verified' : 'Fetch'}
                </button>
              </div>

              {customerData && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-xs space-y-2">
                  <div className="font-bold text-green-800 dark:text-green-300">✓ Customer Verified (Status: {customerData.status})</div>
                  <div><span className="font-semibold">Name:</span> {customerData.name}</div>
                  <div><span className="font-semibold">Phone:</span> {customerData.phone}</div>
                  <div><span className="font-semibold">CNIC:</span> {customerData.cnic}</div>
                  
                  <div className="border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                    <div className="font-bold text-black dark:text-white">
                      Total Assigned Units across properties: <span className="text-primary font-extrabold">{customerData.totalAssignedUnits} / 20 Max</span>
                    </div>
                    {customerData.assignments && customerData.assignments.length > 0 ? (
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                        {customerData.assignments.map((item: any, idx: number) => (
                          <li key={idx}>
                            <span className="font-semibold">{item.propertyTitle}</span>: {item.units} Units ({item.plan})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic mt-0.5">No properties assigned to this CNIC yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Form */}
            {customerData && (
              <form onSubmit={handleSaveAssignment} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                    Units to Assign (Min: 2)
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="2"
                    max="20"
                    value={assignForm.customerUnit}
                    onChange={(e) => setAssignForm({...assignForm, customerUnit: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">1 Unit = Rs. 100,000</p>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Select Plan</label>
                  <select 
                    value={assignForm.plan}
                    onChange={(e) => setAssignForm({...assignForm, plan: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Dual_Benefit">Dual Benefit</option>
                    <option value="Capital_Gain">Capital Gain</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark_border text-black dark:text-white rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`px-4 py-2 rounded-lg text-xs font-medium shadow-xs transition flex items-center justify-center gap-2 ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed text-black' 
                        : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-3 h-3 text-black border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Assignment'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}