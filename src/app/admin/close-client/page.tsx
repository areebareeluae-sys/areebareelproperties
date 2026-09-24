"use client";
import { useState } from "react";

export default function CloseClientPage() {
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [totalClientUnits, setTotalClientUnits] = useState(0); 
  
  // Refund / Close Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [refundUnits, setRefundUnits] = useState<number | ''>('');
  const [customerPin, setCustomerPin] = useState("");
  const [settlementRemarks, setSettlementRemarks] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);
    let formattedValue = value;
    if (value.length > 5 && value.length <= 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }
    setCnic(formattedValue);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cnic) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/close-client?cnic=${cnic}`);
      const result = await res.json();

      if (result.success) {
        const records = result.data.activeRecords || [];
        setClientData(records);
        setPaymentMethods(result.data.paymentMethods || []);
        
        const totalSum = records.reduce((acc: number, curr: any) => acc + Number(curr.customerUnit || 0), 0);
        setTotalClientUnits(totalSum);

        if (records.length === 0) {
          setErrorMsg("No active records found for this CNIC.");
        }
      } else {
        setErrorMsg(result.message || "Failed to fetch data.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (item: any) => {
    setSelectedItem(item);
    setRefundUnits(item.customerUnit);
    setCustomerPin("");
    setSettlementRemarks("");
    setIsModalOpen(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedItem) return;

    const currentPlanUnits = Number(selectedItem.customerUnit);
    const enteredUnits = Number(refundUnits);

    if (refundUnits === '' || isNaN(enteredUnits) || enteredUnits <= 0 || enteredUnits > currentPlanUnits) {
      alert(`Please enter a valid unit quantity between 1 and ${currentPlanUnits}.`);
      return;
    }

    if (!customerPin) {
      alert("Customer PIN is mandatory to proceed.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/close-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedItem.id,
          cnic: cnic,
          pin: customerPin,
          refundUnits: enteredUnits,
          settlementRemarks,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg(result.message);
        setIsModalOpen(false);
        handleSearch();
      } else {
        alert(result.message || "Failed to process refund/close.");
      }
    } catch (err) {
      alert("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 bg-light dark:bg-darkmode text-dark dark:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Search */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-lg border border-border dark:border-dark_border">
          <h1 className="text-2xl font-extrabold mb-2">Refund Units & Close Client Plan</h1>
          <p className="text-sm text-gray-500">Search client by CNIC to view active inventory plans, payment methods, and process unit refunds.</p>
          
          <form onSubmit={handleSearch} className="mt-6 flex gap-4">
            <input
              type="text"
              placeholder="33303-3332783-9"
              value={cnic}
              onChange={handleCnicChange}
              maxLength={15}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/20 text-sm focus:outline-none font-bold"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Client"}
            </button>
          </form>

          {errorMsg && <p className="mt-4 text-sm text-red-500 font-medium">{errorMsg}</p>}
          {successMsg && <p className="mt-4 text-sm text-green-500 font-medium">{successMsg}</p>}
        </div>

        {/* Global Summary Badge */}
        {clientData.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex justify-between items-center text-sm font-semibold">
            <span>Client Total Active Units (All Plans):</span>
            <span className="text-lg font-extrabold text-primary">20 / {totalClientUnits}</span>
          </div>
        )}

        {/* Payment Methods Table View */}
        {paymentMethods.length > 0 && (
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-3">
            <h3 className="font-bold text-md text-primary">Saved Payment Methods</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border dark:border-dark_border text-gray-400">
                    <th className="py-2">Bank Name</th>
                    <th className="py-2">Account Number</th>
                    <th className="py-2">Account Holder</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods.map((pm, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="py-2 font-medium">{pm.bankName}</td>
                      <td className="py-2 font-mono">{pm.accountNumber}</td>
                      <td className="py-2">{pm.accountHolder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Inventory / Plans List */}
        {clientData.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Active Inventory & Plans</h2>
            {clientData.map((item) => (
              <div key={item.id} className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-4">
                <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-primary">{item.plan} Plan</h3>
                    <p className="text-xs text-gray-400">CNIC: {item.cnic} | Profit Date: {item.profitDate}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {item.status}
                  </span>
                </div>

                {item.inventoryDetails && (
                  <div className="bg-gray-100 dark:bg-black/30 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-gray-400 block uppercase">Property Details:</span>
                    <p><strong className="text-primary">{item.inventoryDetails.property_title}</strong> — {item.inventoryDetails.location}, {item.inventoryDetails.country}</p>
                    <p>Category: {item.inventoryDetails.category} | Tag: {item.inventoryDetails.tag} | Price: {item.inventoryDetails.currency} {item.inventoryDetails.price?.toLocaleString()}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Customer Units (This Plan)</span>
                    <span className="font-bold text-base">{item.customerUnit}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Total Price</span>
                    <span className="font-bold text-base">Rs. {item.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Inventory Price</span>
                    <span className="font-bold text-base">Rs. {item.inventoryPrice?.toLocaleString()}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-xs font-medium">Calculated Profit (Today)</span>
                    <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">Rs. {item.calculatedProfit?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => openRefundModal(item)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-md"
                  >
                    Refund Units / Close Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Tailwind Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-semidark text-dark dark:text-white max-w-md w-full p-6 rounded-2xl shadow-2xl border border-border dark:border-dark_border space-y-4">
              <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-3">
                <h3 className="text-lg font-bold">Refund Units & Settlement</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 dark:bg-black/20 p-3.5 rounded-xl text-xs space-y-1.5 border border-border/50">
                  <p><strong>Plan Selected:</strong> {selectedItem.plan}</p>
                  <div className="flex justify-between pt-1 font-semibold text-primary">
                    <span>Total Client Units: 20 / {totalClientUnits}</span>
                    <span>Active in this Plan: {selectedItem.customerUnit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Units to Refund (Max: {selectedItem.customerUnit}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItem.customerUnit}
                    value={refundUnits}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setRefundUnits('');
                      } else {
                        const val = Number(e.target.value);
                        // Strict check: User active units se zyada type nahi kar sakay ga
                        if (val <= selectedItem.customerUnit) {
                          setRefundUnits(val);
                        }
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/25 text-sm focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Aap max {selectedItem.customerUnit} units tak hi refund kar sakte hain.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Customer Security PIN *</label>
                  <input
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/25 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Settlement Remarks / Transaction Notes</label>
                  <input
                    type="text"
                    placeholder="Optional remarks..."
                    value={settlementRemarks}
                    onChange={(e) => setSettlementRemarks(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/25 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-200 dark:bg-darkmode font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleProcessRefund}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-md"
                >
                  {loading ? "Processing..." : "Confirm & Refund"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}