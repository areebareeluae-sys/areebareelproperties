"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function CustomerPaymentPage() {
  const [cnicInput, setCnicInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any[]>([]);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  // Payment Form State
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    bankName: "Meezan Bank",
    customBankName: ""
  });

  // CNIC Auto-formatting & Strict 15-character limit (3303-3332783-9)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 
    if (value.length > 13) value = value.slice(0, 13); 

    let formatted = "";
    if (value.length > 4) {
      formatted = value.slice(0, 5) + "-" + value.slice(5, 12);
      if (value.length > 12) {
        formatted += "-" + value.slice(12, 13);
      }
    } else {
      formatted = value;
    }

    setCnicInput(formatted);
    if (isVerified) {
      setIsVerified(false);
      setAssignmentData([]);
      setIsAlreadySaved(false);
    }
  };

  // Step 1: Verify CNIC and Check Existing Payment Method
  const handleVerifyCnic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicInput.trim() || cnicInput.length < 14) {
      toast.error("Please enter a valid CNIC number!");
      return;
    }

    try {
      setChecking(true);
      const res = await fetch(`/api/customer-payment?cnic=${encodeURIComponent(cnicInput)}`);
      const data = await res.json();

      if (data.success && data.hasAssignment) {
        setIsVerified(true);
        setAssignmentData(data.assignments);

        // Agar pehle se payment method save hai toh form ko pre-fill kar dein
        if (data.existingPayment) {
          setIsAlreadySaved(true);
          const savedBank = data.existingPayment.bankName;
          
          // Check karein ke bank list mein hai ya custom
          const standardBanks = [
            "All Bank of Pakistan", "Meezan Bank", "Allied Bank (ABL)", "Bank Alfalah", 
            "Habib Bank Limited (HBL)", "United Bank Limited (UBL)", "National Bank of Pakistan (NBP)", 
            "MCB Bank", "Faysal Bank", "Askari Bank", "Bank Habib Pakistani", "JazzCash", "EasyPaisa"
          ];

          if (standardBanks.includes(savedBank)) {
            setFormData({
              accountHolder: data.existingPayment.accountHolder,
              accountNumber: data.existingPayment.accountNumber,
              bankName: savedBank,
              customBankName: ""
            });
          } else {
            setFormData({
              accountHolder: data.existingPayment.accountHolder,
              accountNumber: data.existingPayment.accountNumber,
              bankName: "Add By Hand",
              customBankName: savedBank
            });
          }

          toast.success("Existing payment method found! You can update it if needed.");
        } else {
          setIsAlreadySaved(false);
          setFormData({ accountHolder: "", accountNumber: "", bankName: "Meezan Bank", customBankName: "" });
          toast.success("Property assignment found! Add payment details.");
        }
      } else {
        setIsVerified(false);
        setAssignmentData([]);
        toast.error(data.message || "No property assigned to this CNIC.");
      }
    } catch (error) {
      toast.error("Something went wrong while checking CNIC.");
    } finally {
      setChecking(false);
    }
  };

  // Step 2: Submit or Update Payment Method
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error("Please verify CNIC first!");
      return;
    }

    const finalBankName = formData.bankName === "Add By Hand" ? formData.customBankName : formData.bankName;
    if (!finalBankName.trim()) {
      toast.error("Please specify the Bank Name!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        cnic: cnicInput,
        accountHolder: formData.accountHolder,
        accountNumber: formData.accountNumber,
        bankName: finalBankName
      };

      const res = await fetch("/api/customer-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message || "Saved successfully!");
      // Reset everything
      setFormData({ accountHolder: "", accountNumber: "", bankName: "Meezan Bank", customBankName: "" });
      setIsVerified(false);
      setCnicInput("");
      setAssignmentData([]);
      setIsAlreadySaved(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment method.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-28 max-w-xl space-y-6">
      <Toaster position="top-right" />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
          Customer Payment Method Setup
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter CNIC to verify property assignment and manage bank account details.
        </p>
      </div>

      {/* CNIC Search Box */}
      <div className="bg-white dark:bg-semidark p-6 rounded-2xl border border-border dark:border-dark_border shadow-xs space-y-4">
        <form onSubmit={handleVerifyCnic} className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
              Customer CNIC
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="3303-3332783-9"
                value={cnicInput}
                onChange={handleCnicChange}
                maxLength={15}
                disabled={isVerified}
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border border-border dark:border-dark_border bg-gray-50 dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                required
              />
              <button
                type="submit"
                disabled={checking || isVerified}
                className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition flex items-center justify-center gap-2 ${
                  isVerified 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                }`}
              >
                {checking ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Checking...
                  </>
                ) : isVerified ? (
                  'Verified ✓'
                ) : (
                  'Search'
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Format: 3303-3332783-9 (Auto-formatted)</p>
          </div>
        </form>

        {/* Verification Success Box */}
        {isVerified && (
          <div className="mt-6 pt-6 border-t border-border dark:border-dark_border space-y-4 animate-fadeIn">
            <div className={`p-3 border rounded-xl text-xs space-y-1 ${isAlreadySaved ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'}`}>
              <p className={`font-bold ${isAlreadySaved ? 'text-blue-800 dark:text-blue-300' : 'text-green-800 dark:text-green-300'}`}>
                {isAlreadySaved ? 'ℹ️ Existing Payment Method Found (Ready to Update)' : '✓ Property Verified Successfully!'}
              </p>
              <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Assigned Units Count:</span> {assignmentData.length}</p>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <h3 className="text-sm font-bold text-black dark:text-white">
                {isAlreadySaved ? 'Update Bank Account Details' : 'Add Bank Account Details'}
              </h3>
              
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Talha"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-gray-50 dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  required
                  placeholder="PK36MEZN0000000000000000"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border dark:border-dark_border bg-gray-50 dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                  Bank Name
                </label>
                <select
                  value={formData.customBankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-dark_border bg-gray-50 dark:bg-darkmode text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                >
                  <option value="All Bank of Pakistan">All Bank of Pakistan</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                  <option value="Allied Bank (ABL)">Allied Bank (ABL)</option>
                  <option value="Bank Alfalah">Bank Alfalah</option>
                  <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                  <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                  <option value="National Bank of Pakistan (NBP)">National Bank of Pakistan (NBP)</option>
                  <option value="MCB Bank">MCB Bank</option>
                  <option value="Faysal Bank">Faysal Bank</option>
                  <option value="Askari Bank">Askari Bank</option>
                  <option value="Bank Habib Pakistani">Bank Habib Pakistani</option>
                  <option value="JazzCash">JazzCash (Mobile Account)</option>
                  <option value="EasyPaisa">EasyPaisa (Mobile Account)</option>
                  <option value="Add By Hand">✍️ Add By Hand (Custom Bank)</option>
                </select>
              </div>


              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsVerified(false); setCnicInput(""); setAssignmentData([]); setIsAlreadySaved(false); }}
                  className="w-1/3 px-4 py-2.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-dark_border text-black dark:text-white hover:bg-gray-200 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-2/3 px-4 py-2.5 text-xs font-medium rounded-lg text-white transition flex items-center justify-center gap-2 ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : isAlreadySaved ? (
                    'Update Payment Method'
                  ) : (
                    'Save Payment Method'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}