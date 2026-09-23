"use client";
import React, { useState, useEffect, useRef } from "react";
import logo from "../../../../public/images/logo/hissa.png";

export interface EligibilityFormData {
  appNo: string;
  date: string;
  fullName: string;
  cnic: string;
  fatherName: string;
  dob: string;
  mobile: string;
  altContact: string;
  address: string;
categories: string;
  applicantIncome: string;
  applicantIncomeType: string;
  householdIncome: string;
  earningMembers: string;
  dependents: string;
  livingArrangement: string;
  participationAmount: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeCnic: string;
  nomineeMobile: string;
  declarationAccepted: boolean;
  photoUrl: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
}

export default function EligibilityForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [appNoLoading, setAppNoLoading] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<EligibilityFormData>({
    appNo: "",
    date: "",
    fullName: "",
    cnic: "",
    fatherName: "",
    dob: "",
    mobile: "",
    altContact: "",
    address: "",
    categories: "",
    applicantIncome: "",
    applicantIncomeType: "",
    householdIncome: "",
    earningMembers: "",
    dependents: "",
    livingArrangement: "",
    participationAmount: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeCnic: "",
    nomineeMobile: "",
    declarationAccepted: false,
    photoUrl: "",
    cnicFrontUrl: "",
    cnicBackUrl: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null);

  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null);
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const fetchAutoAppNo = async () => {
      setAppNoLoading(true);
      try {
        const res = await fetch("/api/hissa");
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            appNo: data.appNo,
            date: today,
          }));
        } else {
          setFormData((prev) => ({ ...prev, date: today, appNo: "HISSA-0001" }));
        }
      } catch (err) {
        console.error("Failed to fetch auto app no", err);
        setFormData((prev) => ({ ...prev, date: today, appNo: "HISSA-0001" }));
      } finally {
        setAppNoLoading(false);
      }
    };

    fetchAutoAppNo();
  }, []);

  // Helper function to format CNIC: 33303-3332783-9
  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 13);
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
  };

  // Helper function to format numbers with commas (e.g., 200,000,000)
  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return Number(numbers).toLocaleString("en-US");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cnic" || name === "nomineeCnic") {
      setFormData((prev) => ({ ...prev, [name]: formatCNIC(value) }));
    } else if (name === "mobile" || name === "altContact" || name === "nomineeMobile") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 15);
      setFormData((prev) => ({ ...prev, [name]: numbersOnly }));
    } else if (name === "applicantIncome" || name === "householdIncome" || name === "participationAmount") {
      const formatted = formatCurrencyInput(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // const handleCategoryChange = (category: string) => {
  //   setFormData((prev) => {
  //     const exists = prev.categories.includes(category);
  //     if (exists) {
  //       return {
  //         ...prev,
  //         categories: prev.categories.filter((c) => c !== category),
  //       };
  //     } else {
  //       return { ...prev, categories: [...prev.categories, category] };
  //     }
  //   });
  // };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCnicFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCnicFrontFile(file);
      setCnicFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleCnicBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCnicBackFile(file);
      setCnicBackPreview(URL.createObjectURL(file));
    }
  };

const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.fullName.trim()) { alert("Please enter Full Name."); newErrors.fullName = true; isValid = false; }
      else if (!formData.cnic.trim()) { alert("Please enter CNIC No."); newErrors.cnic = true; isValid = false; }
      else if (!formData.fatherName.trim()) { alert("Please enter Father / Husband Name."); newErrors.fatherName = true; isValid = false; }
      else if (!formData.dob) { alert("Please select Date of Birth."); newErrors.dob = true; isValid = false; }
      else if (!formData.mobile.trim()) { alert("Please enter Mobile / WhatsApp number."); newErrors.mobile = true; isValid = false; }
      else if (!formData.altContact.trim()) { alert("Please enter Alternate Contact."); newErrors.altContact = true; isValid = false; }
      else if (!formData.address.trim()) { alert("Please enter Current Address."); newErrors.address = true; isValid = false; }
      else if (!photoFile) { alert("Please upload applicant Photograph."); newErrors.photo = true; isValid = false; }
} else if (currentStep === 2) {
      if (!formData.categories) {
        alert("Please select an eligibility category.");
        newErrors.categories = true;
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!formData.applicantIncome) { alert("Please enter Applicant's Total Monthly Income."); newErrors.applicantIncome = true; isValid = false; }
      else if (!formData.householdIncome) { alert("Please enter Approximate Total Monthly Household Income."); newErrors.householdIncome = true; isValid = false; }
      else if (!formData.applicantIncomeType) { alert("Please select Main Type of Applicant Income."); newErrors.applicantIncomeType = true; isValid = false; }
      else if (!formData.livingArrangement) { alert("Please select Current Living Arrangement."); newErrors.livingArrangement = true; isValid = false; }
      else if (!formData.earningMembers) { alert("Please enter Total Earning Members in Household."); newErrors.earningMembers = true; isValid = false; }
      else if (!formData.dependents) { alert("Please enter Total Dependents."); newErrors.dependents = true; isValid = false; }
    } else if (currentStep === 4) {
      const amountNum = Number(formData.participationAmount);
      if (!formData.participationAmount) {
        alert("Please enter the Participation Amount.");
        newErrors.participationAmount = true;
        isValid = false;
      } else if (amountNum < 200000 || amountNum > 2000000) {
        alert("Participation Amount must be between 200,000 and 2,000,000 PKR.");
        newErrors.participationAmount = true;
        isValid = false;
      }
    } else if (currentStep === 5) {
      if (!cnicFrontFile) { alert("Please upload CNIC Front Image."); newErrors.cnicFront = true; isValid = false; }
      else if (!cnicBackFile) { alert("Please upload CNIC Back Image."); newErrors.cnicBack = true; isValid = false; }
    } else if (currentStep === 6) {
      if (!formData.nomineeName.trim()) { alert("Please enter Nominee Full Name."); newErrors.nomineeName = true; isValid = false; }
      else if (!formData.nomineeRelation.trim()) { alert("Please enter Nominee Relationship."); newErrors.nomineeRelation = true; isValid = false; }
      else if (!formData.nomineeCnic.trim()) { alert("Please enter Nominee CNIC No."); newErrors.nomineeCnic = true; isValid = false; }
      else if (!formData.nomineeMobile.trim()) { alert("Please enter Nominee Mobile / WhatsApp."); newErrors.nomineeMobile = true; isValid = false; }
    } else if (currentStep === 8) {
      if (!formData.declarationAccepted) {
        alert("Please acknowledge and accept the solemn declaration before proceeding.");
        newErrors.declarationAccepted = true;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "real_estate_albums");

    const res = await fetch(`https://api.cloudinary.com/v1_1/y556pcib/image/upload`, {
      method: "POST",
      body: data,
    });

    const fileData = await res.json();
    return fileData.secure_url || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    if (!photoFile || !cnicFrontFile || !cnicBackFile) {
      alert("Please upload applicant photograph, CNIC front, and CNIC back images before submitting.");
      return;
    }

    if (formData.categories.length === 0) {
      alert("Please select at least one eligibility category.");
      return;
    }

    if (!formData.declarationAccepted) {
      alert("Please acknowledge the Solemn Declaration before final submission.");
      return;
    }

    setLoading(true);

    try {
      const uploadedPhotoUrl = await uploadToCloudinary(photoFile);
      const uploadedCnicFrontUrl = await uploadToCloudinary(cnicFrontFile);
      const uploadedCnicBackUrl = await uploadToCloudinary(cnicBackFile);

      const finalPayload = {
        ...formData,
        photoUrl: uploadedPhotoUrl,
        cnicFrontUrl: uploadedCnicFrontUrl,
        cnicBackUrl: uploadedCnicBackUrl,
        categories: JSON.stringify(formData.categories),
        applicantIncome: Number(formData.applicantIncome.replace(/,/g, "")),
        householdIncome: Number(formData.householdIncome.replace(/,/g, "")),
        earningMembers: Number(formData.earningMembers),
        dependents: Number(formData.dependents),
        participationAmount: Number(formData.participationAmount.replace(/,/g, "")),
      };
      const response = await fetch("/api/hissa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const resData = await response.json();

      if (!response.ok) {
        alert(resData.message || "Failed to submit application");
        setLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = printRef.current;

    if (element) {
      element.style.display = "block";

const opt = {
        margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
        filename: `Official_Eligibility_Application_${formData.appNo || "Form"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
      element.style.display = "none";
    }
  };

  const incomeTypes = ["Salary", "Daily wage", "Business", "Pension", "Family support", "None"];
  const livingArrangements = ["Own home", "Rented", "With family / shared"];

  return (
    <div className="min-h-screen  bg-gray-50 flex items-center justify-center pt-44 pb-12 px-4 font-sans text-gray-800 relative">
      
      {/* Full-Page Loading Overlay while fetching application number */}
      {appNoLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-700 animate-pulse">
            Generating application number & loading form...
          </p>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
        
        {isSubmitted ? (
    <div className="text-center py-10 space-y-6">
  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
    ✓
  </div>
  
  <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
  
  <p className="text-sm text-gray-600 max-w-md mx-auto">
    Your application number is <span className="font-bold text-blue-600">{formData.appNo}</span>. You can now download your official completed application form as a PDF.
  </p>

  {/* Credentials Info Box */}
  <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left shadow-sm space-y-2">
    <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
      <span>🔐</span>
      <span>Portal Login Credentials</span>
    </div>
    <p className="text-xs text-blue-800 leading-relaxed">
      A user account has been automatically created for you to track your application status.
    </p>
    <div className="text-xs bg-white p-2.5 rounded-xl border border-blue-100 space-y-1 text-gray-700">
      <p><strong>Username:</strong> Your CNIC Number <span className="text-gray-500">({formData.cnic})</span></p>
      <p><strong>Password:</strong> Last 6 digits of your CNIC</p>
    </div>
    <p className="text-[11px] text-gray-500 italic pt-1">
      💡 Note: If you already have an account with this CNIC, you can log in using your existing password.
    </p>
  </div>

  <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
    <button
      onClick={handleDownloadPDF}
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
    >
      📥 Download Official PDF Form
    </button>
  </div>
</div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                  Section {String.fromCharCode(64 + currentStep)}
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 pl-0">
                      A. APPLICATION & APPLICANT DETAILS
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            APPLICATION NO. <span className="text-red-500"></span>
                          </label>
                          <input
                            type="text"
                            name="appNo"
                            required
                            readOnly
                            value="HISA------"
                            className="w-full border p-2.5 text-sm rounded-lg bg-gray-100 text-gray-600  dark:text-white outline-none cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            DATE <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="date"
                            required
                            readOnly
                            value={formData.date}
                            className="w-full border p-2.5 text-sm rounded-lg bg-gray-100 text-gray-600 outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          FULL NAME <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          maxLength={50}
                          placeholder="e.g., Muhammad Ali"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full border p-2.5 text-sm rounded-lg outline-none focus:ring-2  dark:text-white  focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            CNIC NO. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="cnic"
                            required
                            maxLength={15}
                            placeholder="33303-3332783-9"
                            value={formData.cnic}
                            onChange={handleChange}
                            className="w-full border p-2.5 text-sm rounded-lg outline-none focus:ring-2  dark:text-white  focus:ring-blue-500"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Format: 33303-3332783-9</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            FATHER / HUSBAND NAME <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="fatherName"
                            required
                            maxLength={50}
                            placeholder="e.g., Ahmed Din"
                            value={formData.fatherName}
                            onChange={handleChange}
                            className="w-full border p-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500  dark:text-white "
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        PHOTOGRAPH <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full h-44 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative hover:bg-gray-100 transition">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-500 font-medium text-center px-2">
                            Upload Photo <span className="text-red-500">*</span>
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          required={!photoPreview}
                          onChange={handlePhotoChange}
                          className="absolute inset-0 opacity-0 cursor-pointer  dark:text-white "
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
  <label className="block text-xs font-bold text-gray-700 mb-1">
    Date of Birth <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    name="dob"
    required
    // Aaj se 18 saal pehle ki maximum date calculate karne ke liye
    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
    value={formData.dob}
    onChange={(e) => {
      const selectedDate = new Date(e.target.value);
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }

      if (age < 18) {
        alert("Only for 18+");
        return; // Age 18 se kam ho toh state update na ho
      }

      handleChange(e);
    }}
    className="w-full border p-2.5 text-sm rounded-lg outline-none dark:text-white"
  />
  <p className="text-[10px] text-gray-400 mt-1">Umar kam az kam 18 saal honi zaroori hai.</p>
</div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        MOBILE / WHATSAPP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="mobile"
                        required
                        maxLength={15}
                        placeholder="03XXXXXXXXX"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Digits only: 03123456789</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ALTERNATE CONTACT <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="altContact"
                        required
                        maxLength={15}
                        placeholder="03XXXXXXXXX"
                        value={formData.altContact}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Digits only: 03XXXXXXXXX</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      CURRENT ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      name="address"
                      required
                      maxLength={200}
                      placeholder="e.g., House # 123, Street # 4, Area Name, City"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border p-2.5 text-sm rounded-lg outline-none dark:text-white "
                    ></textarea>
                  </div>
                </div>
              )}

         {currentStep === 2 && (
  <div className="space-y-6">
    <div className="pb-3 mb-4">
      <h2 className="text-xl font-bold text-gray-900 pl-0">
        B. ELIGIBILITY CATEGORY <span className="text-red-500">*</span>
      </h2>
    </div>
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-2 rounded-xl ${errors.categories ? "border border-red-500 bg-red-50/20" : ""}`}>
      {[
        "Disabled / Person with Disability",
        "Low Income",
        "Senior Citizen (65 years or above)",
        "Widow",
      ].map((item, idx) => (
        <label
          key={idx}
          className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition ${
            formData.categories === item 
              ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500" 
              : "border-gray-200 dark:border-gray-700 hover:bg-blue-50/50 bg-white dark:bg-gray-800"
          }`}
        >
          <input
            type="radio"
            name="eligibilityCategory"
            value={item}
            checked={formData.categories === item}
            onChange={() => {
              setErrors((prev) => ({ ...prev, categories: false }));
              setFormData((prev) => ({ ...prev, categories: item }));
            }}
            className="w-5 h-5 text-blue-600 dark:bg-gray-900 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
        </label>
      ))}
    </div>
  </div>
)}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 pl-0">
                      C. FINANCIAL & HOUSEHOLD INFORMATION
                    </h2>
                  </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Yeh field screen par hide rahegi (hidden class ki wajah se) lekin backend/state mein value save karti rahegi */}
  <div className="hidden">
    <label className="block text-xs font-bold text-gray-700 mb-1">
      APPLICANT'S TOTAL MONTHLY INCOME (PKR) <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="applicantIncome"
      required
      placeholder="200,000"
      value={formData.applicantIncome}
      readOnly
      className="w-full border p-2.5 text-sm rounded-lg outline-none bg-gray-50 dark:bg-gray-800 dark:text-white cursor-not-allowed"
    />
    <p className="text-[10px] text-gray-400 mt-1">Synced with household income</p>
  </div>
  
  {/* Yeh wali field screen par show hogi */}
  <div className="md:col-span-2">
    <label className="block text-xs font-bold text-gray-700 mb-1">
      APPROX. TOTAL MONTHLY HOUSEHOLD INCOME (PKR) <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      inputMode="numeric"
      name="householdIncome"
      required
      placeholder="250,000"
      maxLength={10}
      value={formData.householdIncome}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, ""); // Sirf numbers allow hon ge
        if (val.length <= 10) {
          // User jo yahan likhe ga, woh dono fields aur backend ke liye sync hojaye ga
          setFormData((prev) => ({
            ...prev,
            householdIncome: val,
            applicantIncome: val,
          }));
        }
      }}
      className="w-full border p-2.5 text-sm rounded-lg outline-none dark:text-white dark:bg-gray-800 dark:border-gray-700"
    />
    <p className="text-[10px] text-gray-400 mt-1">Enter numbers only (Max 10 digits)</p>
  </div>
</div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      MAIN TYPE OF APPLICANT INCOME <span className="text-red-500">*</span>
                    </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {incomeTypes.map((type, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition ${
                            formData.applicantIncomeType === type 
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500" 
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <input
                            type="radio"
                            name="applicantIncomeType"
                            required
                            value={type}
                            checked={formData.applicantIncomeType === type}
                            onChange={handleChange}
                            className="text-blue-600 dark:bg-gray-900 dark:border-gray-600"
                          />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

        <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
              CURRENT LIVING ARRANGEMENT <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {livingArrangements.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition ${
                    formData.livingArrangement === item 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950 dark:border-blue-500" 
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="livingArrangement"
                    required
                    value={item}
                    checked={formData.livingArrangement === item}
                    onChange={handleChange}
                    className="text-blue-600 dark:bg-gray-900 dark:border-gray-600"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        TOTAL EARNING MEMBERS IN HOUSEHOLD <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="earningMembers"
                        required
                        placeholder="e.g., 2"
                        value={formData.earningMembers}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        TOTAL DEPENDENTS <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="dependents"
                        required
                        placeholder="e.g., 4"
                        value={formData.dependents}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                    </div>
                  </div>
                </div>
              )}

       {currentStep === 4 && (
  <div className="space-y-6">
    <div className="pb-3 mb-4">
      <h2 className="text-xl font-bold text-gray-900 pl-0">
        D. PARTICIPATION DETAILS
      </h2>
    </div>
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">
        PARTICIPATION AMOUNT (PKR) <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        name="participationAmount"
        required
        placeholder="500,000"
        maxLength={7}
        value={formData.participationAmount}
        onChange={(e) => {
          // Sirf numbers allow karne ke liye aur max 69 digits ki limit
          const val = e.target.value.replace(/\D/g, "");
          if (val.length <= 7) {
            setFormData((prev) => ({
              ...prev,
              participationAmount: val,
            }));
          }
        }}
        className="w-full border p-3 text-sm rounded-lg outline-none dark:text-white dark:bg-gray-800 dark:border-gray-700"
      />
      <p className="text-[10px] text-gray-500 mt-1 font-medium">
        Enter amount between 200,000 and 2,000,000 PKR
      </p>
    </div>
  </div>
)}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 pl-0">
                      E. SUPPORTING DOCUMENTS
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-xl bg-gray-50">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CNIC Front Image <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        required={!cnicFrontPreview}
                        onChange={handleCnicFrontChange}
                        className="text-xs mt-2 block w-full"
                      />
                      {cnicFrontPreview && (
                        <img src={cnicFrontPreview} alt="CNIC Front" className="mt-2 h-28 object-contain border rounded" />
                      )}
                    </div>
                    <div className="border p-4 rounded-xl bg-gray-50">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CNIC Back Image <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        required={!cnicBackPreview}
                        onChange={handleCnicBackChange}
                        className="text-xs mt-2 block w-full"
                      />
                      {cnicBackPreview && (
                        <img src={cnicBackPreview} alt="CNIC Back" className="mt-2 h-28 object-contain border rounded" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 pl-0">
                      F. NOMINEE DETAILS
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        NOMINEE FULL NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomineeName"
                        required
                        maxLength={50}
                        placeholder="e.g., Tariq Mehmood"
                        value={formData.nomineeName}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        RELATIONSHIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomineeRelation"
                        required
                        maxLength={50}
                        placeholder="e.g., Brother / Son"
                        value={formData.nomineeRelation}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        CNIC NO. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomineeCnic"
                        required
                        maxLength={15}
                        placeholder="33303-3332783-9"
                        value={formData.nomineeCnic}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white "
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Format: 33303-3332783-9</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        MOBILE / WHATSAPP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomineeMobile"
                        required
                        maxLength={15}
                        placeholder="03XXXXXXXXX"
                        value={formData.nomineeMobile}
                        onChange={handleChange}
                        className="w-full border p-2.5 text-sm rounded-lg outline-none  dark:text-white  "
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Digits only: 03XXXXXXXXX</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 pl-0">
                      G. OFFICE DISCLAIMER
                    </h2>
                  </div>
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg text-xs text-yellow-900">
                    Eligibility Screening Only. Final verification will be handled separately.
                  </div>
                </div>
              )}

        {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 pl-0">
                      H. APPLICANT SOLEMN DECLARATION & UNDERTAKING
                    </h2>
                  </div>

                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 leading-relaxed max-h-64 overflow-y-auto">
                    <p>
                      I solemnly declare and affirm that all information stated by me in this Eligibility Application Form, and every document submitted by me in support of this application, is true, accurate, genuine and complete.
                    </p>
                    <p>
                      I authorize Hissa DLSW to verify any information or document provided by me. I understand that submitting this form does not guarantee eligibility or participation.
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start space-x-3 border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 p-4 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/75 transition">
                      <input
                        type="checkbox"
                        name="declarationAccepted"
                        checked={formData.declarationAccepted}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, declarationAccepted: e.target.checked }))
                        }
                        className="w-5 h-5 text-blue-600 dark:bg-gray-900 dark:border-gray-700 mt-0.5 rounded cursor-pointer"
                        required
                      />
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-200 leading-snug">
                        I have read, understood, and solemnly agree to all the terms, conditions, and undertakings mentioned in the Declaration above. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-4 border-t">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      {/* ======================================================= */}
      {/* PROFESSIONAL PRINT TEMPLATE (WITH IMPORTED LOGO)         */}
      {/* ======================================================= */}
      <div 
        ref={printRef} 
        style={{ display: "none", width: "100%", maxWidth: "800px", margin: "0 auto" }} 
        className="p-6 bg-white text-black font-sans box-border"
      >
        {/* Header with Logo */}
        <div className="flex justify-between items-center pb-3 mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={logo.src} 
              alt="Hissa Logo" 
              className="w-12 h-12 object-contain" 
            />
            <div>
              <p className="text-[10px] text-gray-600 font-medium m-0">Official Eligibility Screening Record & Application Form</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-black m-0">App No: <span>{formData.appNo}</span></p>
            <p className="text-[10px] text-gray-600 m-0">Date: {formData.date}</p>
          </div>
        </div>

        {/* Section A */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            A. Applicant & Personal Details
          </h3>
          <div className="flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px]">
              <p className="m-0"><strong>Full Name:</strong> {formData.fullName}</p>
              <p className="m-0"><strong>CNIC No:</strong> {formData.cnic}</p>
              <p className="m-0"><strong>Father/Husband Name:</strong> {formData.fatherName}</p>
              <p className="m-0"><strong>Date of Birth:</strong> {formData.dob}</p>
              <p className="m-0"><strong>Mobile / WhatsApp:</strong> {formData.mobile}</p>
              <p className="m-0"><strong>Alternate Contact:</strong> {formData.altContact}</p>
              <p className="col-span-2 m-0"><strong>Current Address:</strong> {formData.address}</p>
            </div>
            {photoPreview && (
              <div className="w-20 h-24 border border-gray-400 rounded overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={photoPreview} alt="Applicant" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Section B */}
       {/* Section B */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            B. Selected Eligibility Category
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {formData.categories ? (
              <span className="bg-gray-100 border border-gray-400 text-[10px] px-2.5 py-1 rounded font-medium text-black">
                ✓ {formData.categories}
              </span>
            ) : (
              <span className="text-[10px] text-gray-500 italic">None selected</span>
            )}
          </div>
        </div>

        {/* Section C */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            C. Financial & Household Information
          </h3>
          <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
            <p className="m-0"><strong>Applicant Monthly Income:</strong> PKR {formData.applicantIncome}</p>
            <p className="m-0"><strong>Household Monthly Income:</strong> PKR {formData.householdIncome}</p>
            <p className="m-0"><strong>Primary Income Type:</strong> {formData.applicantIncomeType}</p>
            <p className="m-0"><strong>Living Arrangement:</strong> {formData.livingArrangement}</p>
            <p className="m-0"><strong>Total Earning Members:</strong> {formData.earningMembers}</p>
            <p className="m-0"><strong>Total Dependents:</strong> {formData.dependents}</p>
          </div>
        </div>

        {/* Section D */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            D. Participation Amount
          </h3>
          <p className="text-[11px] font-bold text-black m-0">Requested Amount: PKR {formData.participationAmount}</p>
        </div>

        {/* Section E */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            E. CNIC Supporting Documents
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {cnicFrontPreview && (
              <div>
                <p className="text-[10px] font-bold text-gray-700 mb-1 m-0">CNIC Front</p>
                <img src={cnicFrontPreview} alt="CNIC Front" className="h-24 w-full object-contain border border-gray-400 rounded bg-gray-50 p-1" />
              </div>
            )}
            {cnicBackPreview && (
              <div>
                <p className="text-[10px] font-bold text-gray-700 mb-1 m-0">CNIC Back</p>
                <img src={cnicBackPreview} alt="CNIC Back" className="h-24 w-full object-contain border border-gray-400 rounded bg-gray-50 p-1" />
              </div>
            )}
          </div>
        </div>

        {/* Section F */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            F. Nominee Details
          </h3>
          <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
            <p className="m-0"><strong>Nominee Full Name:</strong> {formData.nomineeName}</p>
            <p className="m-0"><strong>Relationship:</strong> {formData.nomineeRelation}</p>
            <p className="m-0"><strong>Nominee CNIC:</strong> {formData.nomineeCnic}</p>
            <p className="m-0"><strong>Nominee Mobile:</strong> {formData.nomineeMobile}</p>
          </div>
        </div>

        {/* Section G & H */}
        <div className="mb-4" style={{ pageBreakInside: "avoid" }}>
          <h3 className="text-[12px] font-bold text-black pb-0.5 mb-2 uppercase tracking-wide">
            G & H. Solemn Declaration & Undertaking
          </h3>
          <p className="text-[9px] text-gray-700 leading-tight m-0">
            I solemnly declare and affirm that all information stated by me in this application is true and correct. Declaration Accepted: <strong>{formData.declarationAccepted ? "Yes" : "No"}</strong>
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-4 flex justify-between text-[11px]" style={{ pageBreakInside: "avoid" }}>
          <div>
            <p className="font-bold m-0">Applicant Signature</p>
            <div className="mt-6 border-b border-black w-40"></div>
          </div>
          <div>
            <p className="font-bold m-0">Authorized Official Stamp</p>
            <div className="mt-6 border-b border-black w-40"></div>
          </div>
        </div>
      </div>
    </div>
    
  );
}