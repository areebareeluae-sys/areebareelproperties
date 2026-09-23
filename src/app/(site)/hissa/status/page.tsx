"use client";

import React, { useState } from "react";
import { Search, FileText, CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import logo from "../../../../../public/images/logo/hissa.png";

export default function CheckStatusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"cnic" | "appNo">("appNo");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [error, setError] = useState("");

  // Handler for CNIC formatting (e.g., 33303-3332783-9)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length > 5 && val.length <= 12) {
      val = val.slice(0, 5) + "-" + val.slice(5);
    } else if (val.length > 12) {
      val = val.slice(0, 5) + "-" + val.slice(5, 12) + "-" + val.slice(12, 13);
    }
    setSearchTerm(val);
  };

  // Handler for Application No (keeps "HISA-" locked at the start)
  const handleAppNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const prefix = "HISA-";
    
    // Ensure it always starts with HISA-
    if (!val.startsWith(prefix)) {
      val = prefix + val.replace(/HISA-/gi, "").replace(/[^0-9]/g, "");
    } else {
      // Allow typing only numbers after HISA-
      const digits = val.slice(prefix.length).replace(/[^0-9]/g, "");
      val = prefix + digits;
    }
    setSearchTerm(val);
  };

  const handleSearchTypeChange = (type: "cnic" | "appNo") => {
    setSearchType(type);
    if (type === "appNo") {
      setSearchTerm("HISA-");
    } else {
      setSearchTerm("");
    }
    setError("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || searchTerm === "HISA-") {
      setError("Please enter a valid CNIC or Application Number.");
      return;
    }

    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const res = await fetch(`/api/hissa/status?type=${searchType}&value=${searchTerm.trim()}`);
      const data = await res.json();

      if (data.success) {
        setApplication(data.data);
      } else {
        setError(data.message || "Application not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("printable-application");
    if (!element) return;

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
        filename: `Hissa_Application_${application?.appNo || 'record'}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 650 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      };

      html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const getCategoriesList = (catsData: any) => {
    if (!catsData) return [];
    if (Array.isArray(catsData)) return catsData;
    
    try {
      let parsed = JSON.parse(catsData);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) return parsed;
    } catch {
      if (typeof catsData === "string") {
        return catsData.replace(/[\[\]"]/g, "").split(",").map((c) => c.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const categoriesList = application ? getCategoriesList(application.categories) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Track Your Application</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter your Application Number or CNIC to check your status and download your official PDF copy.
          </p>
        </div>

        <div className="bg-white dark:bg-semidark shadow rounded-lg p-6 mb-8 border border-gray-200 dark:border-dark_border">
          <form onSubmit={handleSearch} className="space-y-4">
            
            <div className="flex gap-6 mb-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="appNo"
                  checked={searchType === "appNo"}
                  onChange={() => handleSearchTypeChange("appNo")}
                  className="text-primary focus:ring-primary"
                />
                <span>Application No (e.g. HISA-00001)</span>
              </label>

              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  value="cnic"
                  checked={searchType === "cnic"}
                  onChange={() => handleSearchTypeChange("cnic")}
                  className="text-primary focus:ring-primary"
                />
                <span>CNIC (With dashes)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={searchType === "appNo" ? "HISA-XXXXX" : "33303-3332783-9"}
                value={searchTerm}
                onChange={searchType === "appNo" ? handleAppNoChange : handleCnicChange}
                maxLength={searchType === "appNo" ? undefined : 15}
                className="flex-1 rounded-md border border-gray-300 dark:border-dark_border bg-white dark:bg-darkmode px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-150 disabled:opacity-50 space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Searching..." : "Search"}</span>
              </button>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          </form>
        </div>

        {application && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-semidark shadow rounded-lg p-6 border-t-4 border-primary border border-gray-200 dark:border-dark_border">
              
              <div className="flex items-center space-x-3 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Application No</span>
                  <h3 className="text-xl font-bold text-black dark:text-white">{application.appNo}</h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-dark_border pb-4 mb-4 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                    {application.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                    {application.status !== 'Approved' && application.status !== 'Rejected' && <Clock className="w-4 h-4" />}
                    <span>{application.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6 text-gray-800 dark:text-gray-200">
                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Full Name:</span> {application.fullName}</div>
                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Father's Name:</span> {application.fatherName}</div>
                <div><span className="font-semibold text-gray-500 dark:text-gray-400">CNIC:</span> {application.cnic}</div>
                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Mobile:</span> {application.mobile}</div>
                <div><span className="font-semibold text-gray-500 dark:text-gray-400">Submission Date:</span> {application.date}</div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm transition duration-150 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Copy</span>
                </button>
              </div>
            </div>

            {/* Hidden Printable Section */}
            <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
              <div 
                id="printable-application" 
                style={{ width: "100%", maxWidth: "600px", boxSizing: "border-box", margin: "0 auto" }} 
                className="p-5 bg-white text-black font-sans"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 mb-3 border-b-2 border-gray-800">
                  <div className="flex items-center space-x-2">
                    <img src={logo.src} alt="Logo" className="w-8 h-8 object-contain" />
                    <div>
                      <h1 className="text-base font-black text-black tracking-wider m-0">HISSA DLSW</h1>
                      <p className="text-[8px] text-gray-600 font-medium m-0">Official Eligibility Screening Record & Application Form</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-black m-0">App No: <span>{application.appNo}</span></p>
                    <p className="text-[8px] text-gray-600 m-0">Date: {application.date}</p>
                  </div>
                </div>

                {/* Section A: Personal Details */}
                <div className="mb-2.5">
                  <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                    <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                      A. Applicant & Personal Details
                    </h3>
                  </div>
                  <div className="flex gap-2 items-start px-1">
                    <div className="flex-1 grid grid-cols-2 gap-y-1 gap-x-2 text-[9px]">
                      <p className="m-0"><strong>Full Name:</strong> {application.fullName}</p>
                      <p className="m-0"><strong>CNIC No:</strong> {application.cnic}</p>
                      <p className="m-0"><strong>Father Name:</strong> {application.fatherName}</p>
                      <p className="m-0"><strong>Date of Birth:</strong> {application.dob || "N/A"}</p>
                      <p className="m-0"><strong>Mobile / WhatsApp:</strong> {application.mobile}</p>
                      <p className="m-0"><strong>Alternate Contact:</strong> {application.altContact || "N/A"}</p>
                      <p className="col-span-2 m-0"><strong>Current Address:</strong> {application.address || "N/A"}</p>
                    </div>
                    {application.photoUrl && (
                      <div className="w-14 h-18 border border-gray-400 rounded overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        <img src={application.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Categories */}
                <div className="mb-2.5">
                  <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                    <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                      B. Selected Eligibility Categories
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1 px-1">
                    {categoriesList.length > 0 ? (
                      categoriesList.map((cat: string, i: number) => (
                        <span key={i} className="bg-white border border-gray-400 text-[8px] px-2 py-1 rounded font-medium text-black">
                          ✓ {cat}
                        </span>
                      ))
                    ) : (
                      <p className="text-[9px] text-gray-600 m-0">N/A</p>
                    )}
                  </div>
                </div>

                {/* Section C: Financial Info */}
                <div className="mb-2.5">
                  <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                    <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                      C. Financial & Household Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-[9px] px-1">
                    <p className="m-0"><strong>Applicant Monthly Income:</strong> PKR {application.applicantIncome || "0"}</p>
                    <p className="m-0"><strong>Household Monthly Income:</strong> PKR {application.householdIncome || "0"}</p>
                    <p className="m-0"><strong>Primary Income Type:</strong> {application.applicantIncomeType || "N/A"}</p>
                    <p className="m-0"><strong>Living Arrangement:</strong> {application.livingArrangement || "N/A"}</p>
                  </div>
                </div>

                {/* Section D: Participation Amount */}
                <div className="mb-2.5">
                  <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                    <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                      D. Participation Amount
                    </h3>
                  </div>
                  <p className="text-[9px] font-bold text-black m-0 px-1">Requested Amount: PKR {application.participationAmount || "0"}</p>
                </div>

                {/* Section E: CNIC Documents */}
                {(application.cnicFrontUrl || application.cnicBackUrl) && (
                  <div className="mb-2.5">
                    <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                      <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                        E. CNIC Supporting Documents
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      {application.cnicFrontUrl && (
                        <div className="border border-gray-400 rounded bg-gray-50 p-1 text-center">
                          <p className="text-[8px] font-bold text-gray-700 mb-1 m-0">CNIC Front</p>
                          <div className="h-16 w-full overflow-hidden flex items-center justify-center">
                            <img src={application.cnicFrontUrl} alt="CNIC Front" className="max-h-full max-w-full object-contain" />
                          </div>
                        </div>
                      )}
                      {application.cnicBackUrl && (
                        <div className="border border-gray-400 rounded bg-gray-50 p-1 text-center">
                          <p className="text-[8px] font-bold text-gray-700 mb-1 m-0">CNIC Back</p>
                          <div className="h-16 w-full overflow-hidden flex items-center justify-center">
                            <img src={application.cnicBackUrl} alt="CNIC Back" className="max-h-full max-w-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section F: Nominee Details */}
                <div className="mb-2.5">
                  <div className="bg-gray-100 px-2 py-1 mb-1.5 border-l-4 border-black flex items-center">
                    <h3 className="text-[9px] font-extrabold text-black uppercase tracking-wide m-0 leading-none">
                      F. Nominee Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 text-[9px] px-1">
                    <p className="m-0"><strong>Nominee Name:</strong> {application.nomineeName || "N/A"}</p>
                    <p className="m-0"><strong>Relationship:</strong> {application.nomineeRelation || "N/A"}</p>
                    <p className="m-0"><strong>Nominee CNIC:</strong> {application.nomineeCnic || "N/A"}</p>
                    <p className="m-0"><strong>Nominee Mobile:</strong> {application.nomineeMobile || "N/A"}</p>
                  </div>
                </div>

                {/* Status Box */}
                <div className="mb-3 p-1.5 bg-gray-50 border border-gray-300 rounded text-[9px]">
                  <p className="m-0"><strong>Current Application Status:</strong> <span className="uppercase font-bold">{application.status}</span></p>
                </div>

                {/* Signatures */}
                <div className="mt-6 pt-2 flex justify-between text-[9px]">
                  <div>
                    <p className="font-bold m-0">Applicant Signature</p>
                    <div className="mt-5 border-b border-black w-36"></div>
                  </div>
                  <div>
                    <p className="font-bold m-0">Authorized Official Stamp</p>
                    <div className="mt-5 border-b border-black w-36"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}