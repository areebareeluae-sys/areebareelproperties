"use client";
import { useState } from "react";

export default function CloseClientPage() {
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<any[]>([]);
  const [settlementRemarks, setSettlementRemarks] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // CNIC Auto-formatting function (e.g. 33303-3332783-9)
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
        setClientData(result.data);
        if (result.data.length === 0) {
          setErrorMsg("No records found for this CNIC.");
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

  const handleCloseClient = async (item: any) => {
    if (!confirm(`Are you sure you want to settle Rs. ${item.calculatedProfit || 0} and CLOSE this client?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/close-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: item.id, 
          settlementRemarks,
          finalCalculatedProfit: item.calculatedProfit 
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg(result.message);
        // Refresh data
        handleSearch();
      } else {
        setErrorMsg(result.message || "Failed to close client.");
      }
    } catch (err) {
      setErrorMsg("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 bg-light dark:bg-darkmode text-dark dark:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-lg border border-border dark:border-dark_border">
          <h1 className="text-2xl font-extrabold mb-2">Settle Profit & Close Client Account</h1>
          <p className="text-sm text-gray-500">Search client by CNIC, review calculated profit up to today, payment details, and close plan.</p>
          
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

        {/* Results / Client Details */}
        {clientData.length > 0 && (
          <div className="space-y-4">
            {clientData.map((item) => (
              <div key={item.id} className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-4">
                <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-primary">{item.plan} Plan</h3>
                    <p className="text-xs text-gray-400">CNIC: {item.cnic} | Profit Date: {item.profitDate}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {item.status}
                  </span>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                    <span className="text-gray-400 block text-xs">Customer Units</span>
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

                {/* Payment Method Details Box */}
                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl space-y-2 text-sm border border-border dark:border-dark_border">
                  <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Payment Method & Account Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><span className="text-gray-400 text-xs">Method:</span> <span className="font-medium">{item.paymentMethod || "N/A"}</span></div>
                    <div><span className="text-gray-400 text-xs">Account No:</span> <span className="font-medium">{item.accountNumber || "N/A"}</span></div>
                    <div><span className="text-gray-400 text-xs">Holder Name:</span> <span className="font-medium">{item.accountHolderName || "N/A"}</span></div>
                  </div>
                </div>

                {item.status !== 'Closed' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Settlement & Transaction Notes</label>
                      <input
                        type="text"
                        placeholder="Enter transaction ID or settlement remarks..."
                        value={settlementRemarks}
                        onChange={(e) => setSettlementRemarks(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/20 text-sm focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleCloseClient(item)}
                      disabled={loading}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? "Processing..." : `Settle Profit (Rs. ${item.calculatedProfit || 0}) & Close Client`}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}