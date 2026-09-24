"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Loader from "../../components/shared/Loader"; 

export default function CnicStatusPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Modal State for Image Preview
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

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
          Search by CNIC to view complete application information, images, inventory profit data, and transactions.
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

          {/* 1. Applicant Full Information & Images */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-6">
            
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border dark:border-dark_border pb-4 gap-3">
              <div>
                <h2 className="text-lg font-black text-black dark:text-white">Applicant Profile & Form Information</h2>
                <p className="text-xs text-gray-400">Application Date: {resultData.application.date}</p>
              </div>
              <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-xs rounded-lg font-extrabold uppercase">
                Status: {resultData.application.status}
              </span>
            </div>

            {/* Profile Photo and Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Applicant Profile Photo Card */}
              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border">
                <span className="text-[11px] font-bold text-gray-400 uppercase mb-2">Profile Photo</span>
                {resultData.application.photoUrl ? (
                  <img 
                    src={resultData.application.photoUrl} 
                    alt="Applicant Photo" 
                    onClick={() => setPreviewImage({ url: resultData.application.photoUrl, title: "Applicant Profile Photo" })}
                    className="w-28 h-28 object-cover rounded-xl border border-border dark:border-dark_border cursor-pointer hover:opacity-80 transition shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center bg-gray-200 dark:bg-black/40 text-gray-400 text-xs rounded-xl font-medium">
                    No Photo
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-2 italic">Click image to zoom</span>
              </div>

              {/* Personal Details */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border">
                <div><span className="text-gray-400 block">App No:</span> <strong className="text-black dark:text-white">{resultData.application.appNo}</strong></div>
                <div><span className="text-gray-400 block">Full Name:</span> <strong className="text-black dark:text-white">{resultData.application.fullName}</strong></div>
                <div><span className="text-gray-400 block">CNIC:</span> <strong className="text-black dark:text-white">{resultData.application.cnic}</strong></div>
                <div><span className="text-gray-400 block">Father Name:</span> <strong className="text-black dark:text-white">{resultData.application.fatherName}</strong></div>
                <div><span className="text-gray-400 block">Date of Birth:</span> <strong className="text-black dark:text-white">{resultData.application.dob || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Mobile:</span> <strong className="text-black dark:text-white">{resultData.application.mobile}</strong></div>
                <div><span className="text-gray-400 block">Alt Contact:</span> <strong className="text-black dark:text-white">{resultData.application.altContact || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Address:</span> <strong className="text-black dark:text-white">{resultData.application.address || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Living Arrangement:</span> <strong className="text-black dark:text-white">{resultData.application.livingArrangement || 'N/A'}</strong></div>
              </div>

            </div>

            {/* Financial & Household Info Grid */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Financial & Household Information</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border">
                <div><span className="text-gray-400 block">Applicant Income:</span> <strong className="text-black dark:text-white">Rs. {resultData.application.applicantIncome?.toLocaleString()}</strong></div>
                <div><span className="text-gray-400 block">Income Type:</span> <strong className="text-black dark:text-white">{resultData.application.applicantIncomeType || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Household Income:</span> <strong className="text-black dark:text-white">Rs. {resultData.application.householdIncome?.toLocaleString()}</strong></div>
                <div><span className="text-gray-400 block">Participation Amount:</span> <strong className="text-black dark:text-white">Rs. {resultData.application.participationAmount?.toLocaleString()}</strong></div>
                <div><span className="text-gray-400 block">Earning Members:</span> <strong className="text-black dark:text-white">{resultData.application.earningMembers || '0'}</strong></div>
                <div><span className="text-gray-400 block">Dependents:</span> <strong className="text-black dark:text-white">{resultData.application.dependents || '0'}</strong></div>
              </div>
            </div>

            {/* CNIC Front & Back Images Section */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">CNIC Documents (Front & Back)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CNIC Front */}
                <div className="bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border flex flex-col items-center">
                  <span className="text-[11px] font-bold text-gray-400 mb-2">CNIC Front Side</span>
                  {resultData.application.cnicFrontUrl ? (
                    <img 
                      src={resultData.application.cnicFrontUrl} 
                      alt="CNIC Front" 
                      onClick={() => setPreviewImage({ url: resultData.application.cnicFrontUrl, title: "CNIC Front Side" })}
                      className="w-full h-40 object-cover rounded-xl border border-border dark:border-dark_border cursor-pointer hover:opacity-80 transition shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-200 dark:bg-black/40 text-gray-400 text-xs rounded-xl font-medium">
                      Not Uploaded
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 mt-2 italic">Click to zoom preview</span>
                </div>

                {/* CNIC Back */}
                <div className="bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border flex flex-col items-center">
                  <span className="text-[11px] font-bold text-gray-400 mb-2">CNIC Back Side</span>
                  {resultData.application.cnicBackUrl ? (
                    <img 
                      src={resultData.application.cnicBackUrl} 
                      alt="CNIC Back" 
                      onClick={() => setPreviewImage({ url: resultData.application.cnicBackUrl, title: "CNIC Back Side" })}
                      className="w-full h-40 object-cover rounded-xl border border-border dark:border-dark_border cursor-pointer hover:opacity-80 transition shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-200 dark:bg-black/40 text-gray-400 text-xs rounded-xl font-medium">
                      Not Uploaded
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 mt-2 italic">Click to zoom preview</span>
                </div>

              </div>
            </div>

            {/* Nominee Details */}
            <div className="pt-2 border-t border-border dark:border-dark_border">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Nominee Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs bg-gray-50 dark:bg-darkmode p-4 rounded-2xl border border-border dark:border-dark_border">
                <div><span className="text-gray-400 block">Nominee Name:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeName || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Relation:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeRelation || 'N/A'}</strong></div>
                <div><span className="text-gray-400 block">Nominee CNIC:</span> <strong className="text-black dark:text-white">{resultData.application.nomineeCnic || 'N/A'}</strong></div>
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
                      <div><span className="text-gray-400 block">Unit Price:</span> <strong className="text-black dark:text-white">Rs. {item.inventoryPrice?.toLocaleString()}</strong></div>
                      <div><span className="text-gray-400 block">Inventory Price:</span> <strong className="text-black dark:text-white">Rs. {item.totalPrice?.toLocaleString()}</strong></div>
                      <div><span className="text-gray-400 block">Profit Date:</span> <strong className="text-black dark:text-white">{item.profitDate}</strong></div>
                    </div>

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

          {/* 3. Transaction History with Inventory Details */}
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
                      <th className="px-3 py-3">Linked Property / Inventory</th>
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
                        <td className="px-3 py-3">
                          {tx.inventoryInfo ? (
                            <div>
                              <strong className="text-primary block">{tx.inventoryInfo.property_title}</strong>
                              <span className="text-[10px] text-gray-400">{tx.inventoryInfo.location} | {tx.inventoryInfo.category}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-semidark text-dark dark:text-white max-w-2xl w-full p-5 rounded-2xl shadow-2xl border border-border dark:border-dark_border space-y-4">
            <div className="flex justify-between items-center border-b border-border dark:border-dark_border pb-3">
              <h3 className="text-base font-bold">{previewImage.title}</h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>
            <div className="flex justify-center bg-black/10 dark:bg-black/40 p-3 rounded-xl">
              <img 
                src={previewImage.url} 
                alt="Enlarged View" 
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-6 py-2 bg-gray-200 dark:bg-darkmode font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}