"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function TransferCashPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<any[]>([]);
  const [searchCnic, setSearchCnic] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cash-transfer");
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers || []);
        setFilteredTransfers(data.transfers || []);
      }
    } catch (error) {
      toast.error("Failed to load transfer records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferData();
  }, []);

  // CNIC Auto-formatting and Filter function
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);

    let formattedValue = value;
    if (value.length > 5 && value.length <= 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }

    setSearchCnic(formattedValue);

    if (formattedValue.trim() === "") {
      setFilteredTransfers(transfers);
    } else {
      const filtered = transfers.filter((item) =>
        item.cnic?.toLowerCase().includes(formattedValue.toLowerCase())
      );
      setFilteredTransfers(filtered);
    }
  };

  const openTransferModal = (item: any) => {
    setSelectedItem(item);
    setTransactionNumber("");
    setRemarks("");
    setIsModalOpen(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionNumber.trim()) {
      toast.error("Please enter transaction number!");
      return;
    }

    try {
      setSubmitting(true);
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = loggedInUser.id || "system_admin";

      const payload = {
        id: selectedItem.id, // Supports both assignmentId and pendingId
        type: selectedItem.type,
        customerId: selectedItem.customerId,
        cnic: selectedItem.cnic,
        inventoryId: selectedItem.inventoryId,
        plan: selectedItem.plan,
        calculatedAmount: selectedItem.calculatedAmount,
        transactionNumber: transactionNumber,
        remarks: remarks,
        userId: userId
      };

      const res = await fetch("/api/cash-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Cash transferred and recorded successfully!");
      setIsModalOpen(false);
      fetchTransferData();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete transfer");
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
          <h1 className="text-3xl font-extrabold text-black dark:text-white text-center">Cash Transfer & Dividend Management</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Calculate and transfer profit based on plans and pending dues up to today's date</p>
        </div>

        {/* Filter Box */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Filter by Customer CNIC</label>
              <input 
                type="text" 
                placeholder="33303-3332783-9" 
                value={searchCnic}
                onChange={handleCnicChange}
                maxLength={15}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-gray-500">Loading data...</div>
          ) : filteredTransfers.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 font-bold">No active or due records found for transfer today.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-dark_border text-left text-xs">
                <thead className="bg-gray-50 dark:bg-darkmode text-black dark:text-white font-extrabold uppercase">
                  <tr>
                    <th className="px-4 py-3">Customer CNIC</th>
                    <th className="px-4 py-3">Property / Detail</th>
                    <th className="px-4 py-3">Plan / Type</th>
                    <th className="px-4 py-3">Bank & Account Details</th>
                    <th className="px-4 py-3">Units & Total</th>
                    <th className="px-4 py-3">Profit Due Date</th>
                    <th className="px-4 py-3">Calculated Amount</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark_border font-medium">
                  {filteredTransfers.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                      <td className="px-4 py-4 font-bold text-black dark:text-white">{item.cnic}</td>
                      <td className="px-4 py-4 font-semibold text-black dark:text-white">{item.inventoryName}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded font-bold text-[10px]">
                          {item.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-black dark:text-white">
                        <div className="font-bold">{item.paymentMethod}</div>
                        <div className="text-gray-500 text-[10px]">A/C: {item.accountNumber} ({item.accountHolderName})</div>
                      </td>
                      <td className="px-4 py-4 text-black dark:text-white">
                        <div className="font-bold">{item.customerUnit} Units</div>
                        <div className="text-gray-500 text-[10px]">Total: Rs. {Number(item.totalPrice).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-600 dark:text-gray-300">
                        {new Date(item.profitDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-green-600 dark:text-green-400 font-black text-sm">Rs. {item.calculatedAmount?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => openTransferModal(item)}
                          className="px-4 py-2 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-bold text-xs shadow transition"
                        >
                          Transfer Cash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* TRANSFER MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-semidark text-black dark:text-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-dark_border pb-3">
              <h3 className="text-lg font-black">Transfer Cash Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xl font-bold hover:opacity-70">&times;</button>
            </div>

            <div className="bg-gray-50 dark:bg-darkmode p-3.5 rounded-xl border border-gray-200 dark:border-dark_border text-xs space-y-1.5">
              <div><span className="font-bold">CNIC:</span> {selectedItem.cnic}</div>
              <div><span className="font-bold">Info:</span> {selectedItem.inventoryName}</div>
              <div><span className="font-bold">Plan Type:</span> <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded font-bold">{selectedItem.plan}</span></div>
              <div className="pt-1 border-t border-gray-200 dark:border-dark_border mt-1">
                <span className="font-bold">Bank:</span> {selectedItem.paymentMethod}
              </div>
              <div><span className="font-bold">Account Number:</span> {selectedItem.accountNumber}</div>
              <div><span className="font-bold">Account Holder:</span> {selectedItem.accountHolderName}</div>
              <div className="text-green-600 dark:text-green-400 font-black text-sm pt-2 border-t border-gray-200 dark:border-dark_border mt-1">
                Amount to Transfer: Rs. {selectedItem.calculatedAmount?.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">
                  Transaction Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={transactionNumber}
                  onChange={(e) => setTransactionNumber(e.target.value)}
                  placeholder="Enter bank/transaction ID"
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Remarks / Transfer Note</label>
                <textarea 
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks, e.g., Sent via online banking..."
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
                  {submitting ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}