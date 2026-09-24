"use client";
import { useState } from "react";
import Loader from "../../components/shared/Loader";

interface InventoryProfit {
  id: string;
  cnic: string;
  inventoryPrice: number;
  totalPrice: number;
  customerUnit: number;
  paymentMethod: string;
  plan: string;
  date: string;
  profitDate: string;
  status: string;
}

interface Transaction {
  id: string;
  cnic: string;
  plan: string;
  calculatedAmount: number;
  transactionNumber: string;
  remarks: string;
  date: string;
}

const ROWS_PER_PAGE = 10;

const TransactionHistoryPage = () => {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<{
    inventoryProfits: InventoryProfit[];
    transactions: Transaction[];
  } | null>(null);
  const [error, setError] = useState("");

  // Pagination states for both tables
  const [profitPage, setProfitPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  // CNIC format handle karne ke liye
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
      setError("Please enter a CNIC number.");
      return;
    }

    setLoading(true);
    setError("");
    setHistoryData(null);
    setProfitPage(1);
    setTxPage(1);

    try {
      const res = await fetch(`/api/transaction-history?cnic=${encodeURIComponent(cnicInput)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setHistoryData(data.data);
        if (data.data.inventoryProfits.length === 0 && data.data.transactions.length === 0) {
          setError("No history found for this CNIC.");
        }
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Slicing Helpers
  const paginatedProfits = historyData?.inventoryProfits.slice(
    (profitPage - 1) * ROWS_PER_PAGE,
    profitPage * ROWS_PER_PAGE
  ) || [];

  const totalProfitPages = Math.ceil((historyData?.inventoryProfits.length || 0) / ROWS_PER_PAGE);

  const paginatedTransactions = historyData?.transactions.slice(
    (txPage - 1) * ROWS_PER_PAGE,
    txPage * ROWS_PER_PAGE
  ) || [];

  const totalTxPages = Math.ceil((historyData?.transactions.length || 0) / ROWS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-28 max-w-6xl space-y-6 min-h-screen">
      
      {/* Centered Heading */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          Customer Cash Transaction History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search and view customer inventory profits and cash transaction details by CNIC
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border border-border dark:border-dark_border">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Enter CNIC (e.g. 33303-3332783-9)"
            value={cnicInput}
            onChange={handleCnicChange}
            maxLength={15}
            className="flex-1 w-full px-4 py-3 text-xs rounded-xl bg-gray-100 dark:bg-darkmode text-black dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black font-bold px-6 py-3 rounded-xl text-sm shadow hover:opacity-95 transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search History"} {loading && <Loader />}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>}
      </div>

      {/* Results Section */}
      {historyData && (
        <div className="space-y-6">
          
          {/* 1. Inventory Profit Table */}
          <div className="bg-white dark:bg-semidark rounded-2xl shadow-md border border-border dark:border-dark_border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Inventory Profit History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-darkmode text-black dark:text-white text-xs font-bold border-b border-border dark:border-dark_border">
                    <th className="p-3">Plan</th>
                    <th className="p-3">Units</th>
                    <th className="p-3">Total Price</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {paginatedProfits.length > 0 ? (
                    paginatedProfits.map((item) => (
                      <tr key={item.id} className="border-b border-border dark:border-dark_border hover:bg-gray-50 dark:hover:bg-darkmode/50 transition">
                        <td className="p-3 text-black dark:text-white font-medium">{item.plan}</td>
                        <td className="p-3 text-black dark:text-white">{item.customerUnit}</td>
                        <td className="p-3 text-black dark:text-white font-bold">Rs. {Number(item.totalPrice).toLocaleString()}</td>
                        <td className="p-3 text-black dark:text-white">{item.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">{item.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">No inventory profit records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Profit Table Pagination Controls */}
            {totalProfitPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border dark:border-dark_border text-xs">
                <span className="text-gray-500">Page {profitPage} of {totalProfitPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProfitPage((prev) => Math.max(prev - 1, 1))}
                    disabled={profitPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkmode disabled:opacity-50 font-bold"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setProfitPage((prev) => Math.min(prev + 1, totalProfitPages))}
                    disabled={profitPage === totalProfitPages}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkmode disabled:opacity-50 font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cash Transaction History Table */}
          <div className="bg-white dark:bg-semidark rounded-2xl shadow-md border border-border dark:border-dark_border p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">Cash Transactions History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-darkmode text-black dark:text-white text-xs font-bold border-b border-border dark:border-dark_border">
                    <th className="p-3">Transaction #</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Remarks</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border dark:border-dark_border hover:bg-gray-50 dark:hover:bg-darkmode/50 transition">
                        <td className="p-3 text-black dark:text-white font-mono font-medium">{tx.transactionNumber}</td>
                        <td className="p-3 text-black dark:text-white">{tx.plan}</td>
                        <td className="p-3 text-black dark:text-white font-bold">Rs. {Number(tx.calculatedAmount).toLocaleString()}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">{tx.remarks}</td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">{tx.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">No cash transaction records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Transaction Table Pagination Controls */}
            {totalTxPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border dark:border-dark_border text-xs">
                <span className="text-gray-500">Page {txPage} of {totalTxPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTxPage((prev) => Math.max(prev - 1, 1))}
                    disabled={txPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkmode disabled:opacity-50 font-bold"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setTxPage((prev) => Math.min(prev + 1, totalTxPages))}
                    disabled={txPage === totalTxPages}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkmode disabled:opacity-50 font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default TransactionHistoryPage;