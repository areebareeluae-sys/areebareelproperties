"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../../components/shared/Loader"; // Apne project ke mutabiq loader path adjust kar lein

export default function CnicStatusPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // CNIC Auto-Formatting Function (XXXXX-XXXXXXX-X)
  const formatCnicInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnicInput(e.target.value);
    setCnicInput(formatted);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicInput.trim() || cnicInput.length < 15) {
      toast.error("Please enter a complete valid CNIC");
      return;
    }

    try {
      setLoading(true);
      setResultData(null);
      const res = await fetch(`/api/cnic-status?cnic=${cnicInput}`);
      const data = await res.json();

      if (data.success) {
        setResultData(data.data);
        toast.success("Data fetched successfully!");
      } else {
        toast.error(data.message || "No records found!");
      }
    } catch (error) {
      toast.error("Failed to fetch data. Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-28 max-w-5xl space-y-8">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
          CNIC Status & Profile Details
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Search by CNIC to view complete application information, inventory profit data, property details, and transactions.
        </p>
      </div>

      {/* Search Box Card */}
      <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="e.g. 33330-3333278-9" 
            maxLength={15}
            value={cnicInput}
            onChange={handleCnicChange}
            className="w-full text-xs p-3 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-darkmode text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-bold"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl hover:opacity-90 transition whitespace-nowrap shadow-xs"
          >
            {loading ? 'Searching...' : 'Search Details'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      )}

      {/* Results Section */}
      {resultData && (
        <div className="space-y-6">

          {/* 1. Application & Applicant Details */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-black dark:text-white border-b border-border dark:border-dark_border pb-3 flex items-center justify-between">
              <span>Section A & C: Applicant & Personal Details</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-darkmode text-xs rounded-lg font-bold">Status: {resultData.application.status}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div><span className="text-gray-400 block">App No:</span> <strong className="text-black dark:text-white">{resultData.application.appNo}</strong></div>
              <div><span className="text-gray-400 block">Full Name:</span> <strong className="text-black dark:text-white">{resultData.application.fullName}</strong></div>
              <div><span className="text-gray-400 block">CNIC:</span> <strong className="text-black dark:text-white">{resultData.application.cnic}</strong></div>
              <div><span className="text-gray-400 block">Father Name:</span> <strong className="text-black dark:text-white">{resultData.application.fatherName}</strong></div>
              <div><span className="text-gray-400 block">Mobile:</span> <strong className="text-black dark:text-white">{resultData.application.mobile}</strong></div>
              <div><span className="text-gray-400 block">Date of Birth:</span> <strong className="text-black dark:text-white">{resultData.application.dob || 'N/A'}</strong></div>
              <div><span className="text-gray-400 block">Applicant Income:</span> <strong className="text-black dark:text-white">Rs. {resultData.application.applicantIncome?.toLocaleString()}</strong></div>
              <div><span className="text-gray-400 block">Household Income:</span> <strong className="text-black dark:text-white">Rs. {resultData.application.householdIncome?.toLocaleString()}</strong></div>
              <div><span className="text-gray-400 block">Address:</span> <strong className="text-black dark:text-white">{resultData.application.address || 'N/A'}</strong></div>
            </div>

            {/* Nominee Details */}
            <div className="pt-3 border-t border-border dark:border-dark_border">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Nominee Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div><span className="text-gray-400 block">Nominee Name:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeName || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Relation:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeRelation || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Nominee Mobile:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeMobile || 'N/A'}</strong></div>
              </div>
            </div>
          </div>

          {/* 2. Inventory Profit & Property Details */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-black dark:text-white border-b border-border dark:border-dark_border pb-3">
              Inventory & Profit Assignments
            </h2>

            {resultData.inventories.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No inventory assigned to this CNIC.</p>
            ) : (
              <div className="space-y-4">
                {resultData.inventories.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-darkmode rounded-xl border border-border dark:border-dark_border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg">
                        Plan: {item.plan}
                      </span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        Status: {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-400 block">Customer Units:</span> <strong className="text-black dark:text-white">{item.customerUnit}</strong></div>
                      <div><span className="text-gray-400 block">Inventory Price:</span> <strong className="text-black dark:text-white">Rs. {item.inventoryPrice?.toLocaleString()}</strong></div>
                      <div><span className="text-gray-400 block">Total Price:</span> <strong className="text-black dark:text-white">Rs. {item.totalPrice?.toLocaleString()}</strong></div>
                      <div><span className="text-gray-400 block">Profit Date:</span> <strong className="text-black dark:text-white">{item.profitDate}</strong></div>
                    </div>

                    {/* Inventory Property Details Info */}
                    {item.inventoryInfo && (
                      <div className="mt-2 pt-3 border-t border-border dark:border-dark_border">
                        <h4 className="text-[11px] font-bold uppercase text-gray-400 mb-2">Linked Property Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div><span className="text-gray-400 block">Property Title:</span> <strong className="text-black dark:text-white">{item.inventoryInfo.property_title}</strong></div>
                          <div><span className="text-gray-400 block">Location:</span> <strong className="text-black dark:text-white">{item.inventoryInfo.location}, {item.inventoryInfo.country}</strong></div>
                          <div><span className="text-gray-400 block">Category / Tag:</span> <strong className="text-black dark:text-white">{item.inventoryInfo.category} ({item.inventoryInfo.tag})</strong></div>
                          <div><span className="text-gray-400 block">Beds / Baths / Area:</span> <strong className="text-black dark:text-white">{item.inventoryInfo.beds} Beds | {item.inventoryInfo.baths} Baths | {item.inventoryInfo.sqrft} sqft</strong></div>
                          <div><span className="text-gray-400 block">Property Price:</span> <strong className="text-black dark:text-white">Rs. {item.inventoryInfo.price?.toLocaleString()}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Transaction History */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-4">
            <h2 className="text-base font-bold text-black dark:text-white border-b border-border dark:border-dark_border pb-3">
              Transaction History
            </h2>

            {resultData.transactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No transaction records found for this CNIC.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-border dark:divide-dark_border">
                  <thead className="bg-gray-50 dark:bg-darkmode text-black dark:text-white font-extrabold uppercase">
                    <tr>
                      <th className="px-3 py-3">Tx Number</th>
                      <th className="px-3 py-3">Plan</th>
                      <th className="px-3 py-3">Calculated Amount</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-dark_border font-medium text-black dark:text-white">
                    {resultData.transactions.map((tx: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-darkmode/50">
                        <td className="px-3 py-3 font-bold">{tx.transactionNumber}</td>
                        <td className="px-3 py-3">{tx.plan}</td>
                        <td className="px-3 py-3 text-green-600 font-bold">Rs. {tx.calculatedAmount?.toLocaleString()}</td>
                        <td className="px-3 py-3">{tx.date}</td>
                        <td className="px-3 py-3 text-gray-500">{tx.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}