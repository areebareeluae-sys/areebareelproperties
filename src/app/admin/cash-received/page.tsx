"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const SOURCE_DESTINATION_OPTIONS = [
  "Cash by hand",
  "Malik Imran",
  "Areeb",
  "Areel",
  "Meezan Bank",
  "HBL",
  "Alfalah",
  "Allied Bank",
  "UBL",
  "National Bank",
  "Bank Alfalah",
  "Bank Al Habib",
  "Faysal Bank",
  "MCB Bank",
  "Askari Bank",
  "Other"
];

export default function InternalCashPage() {
  const [searchCnic, setSearchCnic] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);

  // Form states
  const [transactionType, setTransactionType] = useState("Cash In"); // Cash In or Cash Out / Cash Send
  const [amount, setAmount] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [givenTo, setGivenTo] = useState("");
  const [slipNumber, setSlipNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-set values based on Transaction Type and Application CNIC
  useEffect(() => {
    if (application) {
      const customerCnicLabel = `CNIC: ${application.cnic}`;
      if (transactionType === "Cash In") {
        setReceivedFrom(customerCnicLabel); // Cash In mein source customer CNIC hoga
        setGivenTo("Malik Imran");         // Default recipient
      } else {
        setReceivedFrom("Cash by hand");    // Default source for cash out
        setGivenTo(customerCnicLabel);     // Cash Out mein destination customer CNIC hoga
      }
    }
  }, [transactionType, application]);

  // CNIC Masking
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
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCnic.trim()) {
      toast.error("Please enter CNIC");
      return;
    }

    try {
      setLoading(true);
      setApplication(null);
      const res = await fetch(`/api/cash-received?cnic=${searchCnic}`);
      const data = await res.json();

      if (data.success && data.applications.length > 0) {
        const app = data.applications[0];
        setApplication(app);
        
        // Set initial defaults based on type
        if (transactionType === "Cash In") {
          setReceivedFrom(`CNIC: ${app.cnic}`);
          setGivenTo("Malik Imran");
        } else {
          setReceivedFrom("Cash by hand");
          setGivenTo(`CNIC: ${app.cnic}`);
        }

        toast.success("Application loaded!");
      } else {
        toast.error("No application found against this CNIC.");
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) {
      toast.error("Please select an application first!");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter valid amount!");
      return;
    }

    try {
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        cnic: application.cnic,
        customerName: application.fullName,
        agentId: user.id || "admin_id",
        agentName: user.name || "Admin/Agent",
        transactionType,
        receivedFrom,
        givenTo,
        amount: Number(amount),
        slipOrRefNumber: slipNumber,
        internalRemarks: remarks,
      };

      const res = await fetch("/api/cash-received", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Internal cash record saved successfully!");
      setAmount("");
      setSlipNumber("");
      setRemarks("");
    } catch (error: any) {
      toast.error(error.message || "Error saving record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-12 px-4 sm:px-6 lg:px-8 text-black dark:text-white">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border">
          <h1 className="text-2xl font-black text-center">Internal Cash Tracking (In / Send)</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Manage dynamic cash entries linked with customer CNIC.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs uppercase font-extrabold mb-2">Search by Customer CNIC</label>
              <input 
                type="text" 
                placeholder="33303-3332783-9" 
                value={searchCnic}
                onChange={handleCnicChange}
                maxLength={15}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent font-bold outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs shadow"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Details & Form */}
        {application && (
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border space-y-4">
            <h3 className="text-sm font-black uppercase text-primary border-b border-gray-200 dark:border-dark_border pb-2">
              Application Found: {application.fullName} ({application.cnic})
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Transaction Type Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Transaction Type *</label>
                  <select 
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-white dark:bg-darkmode font-bold outline-none"
                  >
                    <option value="Cash In">Cash In (Received from Customer CNIC)</option>
                    <option value="Cash Out / Cash Send">Cash Out / Cash Send (Given to Customer CNIC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Amount (Rs.) *</label>
                  <input 
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-transparent font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Slip / Reference Number</label>
                  <input 
                    type="text"
                    value={slipNumber}
                    onChange={(e) => setSlipNumber(e.target.value)}
                    placeholder="Ref ID / Slip No"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-transparent font-bold outline-none"
                  />
                </div>

                {/* Received From Field (Dynamic based on transactionType) */}
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Cash Received From (Source) *</label>
                  {transactionType === "Cash In" ? (
                    <input 
                      type="text"
                      disabled
                      value={`CNIC: ${application.cnic}`}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-gray-100 dark:bg-dark_border font-bold outline-none cursor-not-allowed"
                    />
                  ) : (
                    <select 
                      value={receivedFrom}
                      onChange={(e) => setReceivedFrom(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-white dark:bg-darkmode font-bold outline-none"
                    >
                      {SOURCE_DESTINATION_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Given To Field (Dynamic based on transactionType) */}
                <div>
                  <label className="block text-[11px] uppercase font-extrabold mb-1">Cash Given To (Destination) *</label>
                  {transactionType === "Cash Out / Cash Send" ? (
                    <input 
                      type="text"
                      disabled
                      value={`CNIC: ${application.cnic}`}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-gray-100 dark:bg-dark_border font-bold outline-none cursor-not-allowed"
                    />
                  ) : (
                    <select 
                      value={givenTo}
                      onChange={(e) => setGivenTo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-white dark:bg-darkmode font-bold outline-none"
                    >
                      {SOURCE_DESTINATION_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Internal Remarks (Only for Admin)</label>
                <textarea 
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Internal notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-dark_border bg-transparent outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs shadow"
                >
                  {submitting ? "Saving..." : "Save Internal Record"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}