"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function UpgradeInventoryPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any[]>([]);
  
  // Modal & Upgrade Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
  // Form fields inside popup
  const [finalUnits, setFinalUnits] = useState<number>(2); 
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      let cleanDateStr = dateString;
      const datePart = dateString.split('T')[0];
      if (datePart) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          cleanDateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}${dateString.includes('T') ? 'T' + dateString.split('T')[1] : ''}`;
        }
      }
      const date = new Date(cleanDateStr);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  // Fetch assigned property data by CNIC
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicInput.trim()) {
      toast.error("Please enter a valid CNIC!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/upgrade-inventory?cnic=${cnicInput}`);
      const data = await res.json();
      
      if (data.success) {
        setCustomerData(data.assignments || []);
        if (data.assignments.length === 0) {
          toast.error("No active assigned inventory found for this CNIC.");
        }
      } else {
        toast.error(data.message || "Failed to fetch data.");
        setCustomerData([]);
      }
    } catch (error) {
      toast.error("Error fetching data from server.");
    } finally {
      setLoading(false);
    }
  };

  // Open Upgrade Modal
  const openUpgradeModal = (item: any) => {
    setSelectedAssignment(item);
    setFinalUnits(item.customerUnit || 2);
    setPaymentMethod(item.paymentMethod || "Bank Transfer");
    setAccountNumber(item.accountNumber || "");
    setAccountHolderName(item.accountHolderName || "");
    setTransactionNumber("");
    setRemarks("Inventory Upgrade / Profit Settlement");
    setIsModalOpen(true);
  };

  // Calculate accumulated profit
  const calculateAccumulatedProfit = () => {
    if (!selectedAssignment || !selectedAssignment.profitDate) return 0;
    
    let cleanDateStr = selectedAssignment.profitDate;
    const datePart = cleanDateStr.split('T')[0];
    if (datePart) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        cleanDateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}${cleanDateStr.includes('T') ? 'T' + cleanDateStr.split('T')[1] : ''}`;
      }
    }

    const profitDate = new Date(cleanDateStr);
    if (isNaN(profitDate.getTime())) return 0;

    const today = new Date();
    const diffTime = today.getTime() - profitDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;

    const units = Number(selectedAssignment.customerUnit || 0);
    const unitPrice = 100000; 
    
    let baseInvestment = units * unitPrice;
    let planName = String(selectedAssignment.plan || "").toUpperCase();

    let yearlyProfit = baseInvestment * 0.08;
    let monthlyProfit = yearlyProfit / 12;

    if (planName.includes("F")) {
      monthlyProfit += 1400;
    }

    const dailyRate = monthlyProfit / 30;
    return Math.round(dailyRate * diffDays);
  };

  const accumulatedProfit = calculateAccumulatedProfit();
  const currentUnits = selectedAssignment ? selectedAssignment.customerUnit : 0;
  
  // Calculated Inventory Price (Units * 100,000)
  const calculatedInventoryPrice = Number(finalUnits) * 100000;

  // Submit Upgrade/Downgrade Request
  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (finalUnits < 2 || finalUnits > 20) {
      toast.error("Units must be at least 2 and cannot exceed 20!");
      return;
    }
    if (!transactionNumber.trim()) {
      toast.error("Please enter the transaction/payment number!");
      return;
    }

    try {
      setSubmitting(true);
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = loggedInUser.id || "system_admin";

      const payload = {
        assignmentId: selectedAssignment.assignmentId,
        inventoryId: selectedAssignment.inventoryId,
        customerId: selectedAssignment.customerId,
        cnic: selectedAssignment.cnic,
        oldUnits: currentUnits,
        newUnits: Number(finalUnits),
        newInventoryPrice: calculatedInventoryPrice,
        accumulatedProfit: accumulatedProfit,
        paymentMethod: paymentMethod,
        accountNumber: accountNumber,
        accountHolderName: accountHolderName,
        transactionNumber: transactionNumber,
        remarks: remarks,
        userId: userId
      };

      const res = await fetch("/api/upgrade-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upgrade inventory");

      toast.success("Inventory updated & profit settled successfully!");
      setIsModalOpen(false);
      handleSearch({ preventDefault: () => {} } as any);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-black dark:text-white text-center">Upgrade / Downgrade Assigned Inventory</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Search customer by CNIC to modify units (Min 2, Max 20), settle pending profits, and update cycles.</p>
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
              {loading ? "Searching..." : "Fetch Data"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {customerData.length > 0 && (
          <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-dark_border font-black text-sm uppercase text-black dark:text-white bg-gray-50 dark:bg-darkmode">
              Assigned Properties for CNIC: {cnicInput}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-dark_border text-left text-xs">
                <thead className="bg-gray-50 dark:bg-darkmode font-extrabold uppercase text-black dark:text-white">
                  <tr>
                    <th className="px-4 py-3">Property Name</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Current Units</th>
                    <th className="px-4 py-3">Inventory Price</th>
                    <th className="px-4 py-3">Total Price (Unchanged)</th>
                    <th className="px-4 py-3">Last Profit Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark_border font-medium">
                  {customerData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                      <td className="px-4 py-4 font-bold text-black dark:text-white">{item.inventoryName}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded font-bold text-[10px]">
                          {item.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-extrabold text-sm text-black dark:text-white">{item.customerUnit} Units</td>
                      <td className="px-4 py-4 text-black dark:text-white">Rs. {Number(item.inventoryPrice || (item.customerUnit * 100000)).toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-500 font-bold">Rs. {item.totalPrice ? Number(item.totalPrice).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-4 text-gray-500">{formatDate(item.profitDate)}</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => openUpgradeModal(item)}
                          className="px-4 py-2 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-bold text-xs transition"
                        >
                          Upgrade / Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* UPGRADE / MODIFY POPUP MODAL */}
      {isModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-semidark text-black dark:text-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-dark_border pb-3">
              <h3 className="text-lg text-black dark:text-white font-black">Upgrade / Modify Inventory Units</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xl font-bold hover:opacity-70">&times;</button>
            </div>

            {/* Summary details */}
            <div className="bg-gray-50 dark:bg-darkmode p-3 rounded-xl border border-gray-200 dark:border-dark_border text-xs space-y-1.5">
              <div><span className="font-bold">Property:</span> {selectedAssignment.inventoryName}</div>
              <div><span className="font-bold">Plan Type:</span> <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded font-bold">{selectedAssignment.plan}</span></div>
              <div><span className="font-bold">Payment Method:</span> <span className="text-blue-600 dark:text-blue-400 font-extrabold">{selectedAssignment.paymentMethod || 'N/A'}</span></div>
              <div><span className="font-bold">Account Number:</span> <span className="font-mono font-bold">{selectedAssignment.accountNumber || 'N/A'}</span></div>
              <div><span className="font-bold">Account Holder Name:</span> <span className="font-bold">{selectedAssignment.accountHolderName || 'N/A'}</span></div>
              <div><span className="font-bold">Current Units:</span> {currentUnits} Units</div>
              <div><span className="font-bold">Original Total Price (Unchanged):</span> Rs. {selectedAssignment.totalPrice ? Number(selectedAssignment.totalPrice).toLocaleString() : 'N/A'}</div>
              <div><span className="font-bold">Last Profit Date:</span> {formatDate(selectedAssignment.profitDate)}</div>
              <div className="text-green-600 dark:text-green-400 font-black text-sm pt-1 border-t border-gray-200 dark:border-dark_border mt-1">
                Accumulated Profit (Up to Today): Rs. {accumulatedProfit.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleUpgradeSubmit} className="space-y-3">
              
              {/* Target / Final Unit Field with Min 2 and Max 20 Validation */}
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">
                  New Total Units (Min: 2, Max: 20) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  min={2}
                  max={20}
                  value={finalUnits}
                  onChange={(e) => setFinalUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  New Inventory Price: <span className="font-bold text-black dark:text-white">Rs. {calculatedInventoryPrice.toLocaleString()}</span> (Calculated as Units × Rs. 100,000)
                </p>
              </div>

              {/* Payment Method Details (Read-Only) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Payment Method (Read-Only)</label>
                  <input 
                    type="text" 
                    value={paymentMethod}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-gray-100 dark:bg-darkmode/50 text-gray-600 dark:text-gray-400 font-bold cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Transaction / Receipt No <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="Enter Transaction ID"
                    className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Account Number (Read-Only)</label>
                  <input 
                    type="text" 
                    value={accountNumber}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-gray-100 dark:bg-darkmode/50 text-gray-600 dark:text-gray-400 font-bold cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Account Holder Name (Read-Only)</label>
                  <input 
                    type="text" 
                    value={accountHolderName}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-gray-100 dark:bg-darkmode/50 text-gray-600 dark:text-gray-400 font-bold cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Remarks</label>
                <textarea 
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded text-xs font-bold hover:opacity-80 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold shadow hover:opacity-90 transition"
                >
                  {submitting ? 'Processing...' : 'Confirm Upgrade & Settle Profit'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}