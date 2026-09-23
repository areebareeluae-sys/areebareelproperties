"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../../components/shared/Loader";

export default function InventoryAssignmentPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    plan: "Gold8*F",
    paymentMethod: "By Hand",
    accountNumber: "",
    accountHolderName: ""
  });

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
    setAssignForm({ customerUnit: "2", plan: "Gold8*F", paymentMethod: "By Hand", accountNumber: "", accountHolderName: "" });
    setIsModalOpen(true);
  };

  const handleVerifyCnic = async () => {
    if (!cnicInput.trim()) {
      toast.error("Please enter a valid CNIC");
      return;
    }

    try {
      setFetchingCustomer(true);
      const res = await fetch(`/api/customers/verify-cnic?cnic=${cnicInput}`);
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
      toast.error("Assigned units cannot exceed pending units!");
      return;
    }

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        inventoryId: selectedInventory.id,
        cnic: customerData.cnic,
        customerUnit: units,
        plan: assignForm.plan,
        paymentMethod: assignForm.paymentMethod,
        accountNumber: assignForm.accountNumber,
        accountHolderName: assignForm.accountHolderName,
        actorId: loggedInUser.id || "system_admin"
      };

      const res = await fetch("/api/inventory-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Property assigned successfully and logged!");
      setIsModalOpen(false);
      fetchInventories();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign property");
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
      
      {/* Centered Heading */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          Inventory Management & Assignment
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          1 Unit = Rs. 100,000 (Min 2, Max 20 Units allowed)
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

            {/* Pagination Controls */}
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
                  placeholder="Enter CNIC (e.g., 35202-xxxxxxx-x)"
                  value={cnicInput}
                  disabled={Boolean(customerData)}
                  onChange={(e) => setCnicInput(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-semidark text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${customerData ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-green-800 dark:text-green-300">✓ Customer Verified (Status: {customerData.status})</div>
                  <div><span className="font-semibold">Name:</span> {customerData.name}</div>
                  <div><span className="font-semibold">Phone Number:</span> {customerData.phone}</div>
                  <div><span className="font-semibold">CNIC:</span> {customerData.cnic}</div>
                </div>
              )}
            </div>

            {/* Assignment Form */}
            {customerData && (
              <form onSubmit={handleSaveAssignment} className="space-y-3">
                
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                    Units to Assign (Min: 2, Max: 20 | Pending: {selectedInventory.pendingUnit})
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="2"
                    max={Math.min(20, selectedInventory.pendingUnit)}
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
                    <option value="Gold8*F">Gold8*F</option>
                    <option value="Silver 8+L">Silver 8+L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Payment Method</label>
                  <select 
                    value={assignForm.paymentMethod}
                    onChange={(e) => setAssignForm({...assignForm, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="By Hand">By Hand</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <optgroup label="Commercial & Islamic Banks">
                      <option value="Allied Bank Limited (ABL)">Allied Bank Limited (ABL)</option>
                      <option value="Askari Bank">Askari Bank</option>
                      <option value="Bank Alfalah">Bank Alfalah</option>
                      <option value="Bank Al-Habib">Bank Al-Habib</option>
                      <option value="Faysal Bank">Faysal Bank</option>
                      <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                      <option value="Habib Metropolitan Bank">Habib Metropolitan Bank</option>
                      <option value="MCB Bank Limited">MCB Bank Limited</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                      <option value="National Bank of Pakistan (NBP)">National Bank of Pakistan (NBP)</option>
                      <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                      <option value="The Bank of Punjab (BOP)">The Bank of Punjab (BOP)</option>
                      <option value="UBL (United Bank Limited)">UBL (United Bank Limited)</option>
                      <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                      <option value="JS Bank">JS Bank</option>
                      <option value="BankIslami Pakistan">BankIslami Pakistan</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={assignForm.accountHolderName}
                      onChange={(e) => setAssignForm({...assignForm, accountHolderName: e.target.value})}
                      placeholder="Account holder name"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={assignForm.accountNumber}
                      onChange={(e) => setAssignForm({...assignForm, accountNumber: e.target.value})}
                      placeholder="Account number / IBAN"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 py-2 bg-gray-100 dark:bg-dark_border text-black dark:text-white rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-medium shadow-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                  >
                    Save Assignment
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