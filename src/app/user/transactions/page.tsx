"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/shared/Loader";

interface FormApplication {
  id: string;
  appNo: string;
  date: string;
  fullName: string;
  cnic: string;
  fatherName: string;
  dob: string | null;
  mobile: string;
  altContact: string | null;
  address: string | null;
  photoUrl: string | null;
  categories: string | null;
  applicantIncome: number | null;
  householdIncome: number | null;
  applicantIncomeType: string | null;
  livingArrangement: string | null;
  earningMembers: string | null;
  dependents: string | null;
  participationAmount: number | null;
  cnicFrontUrl: string | null;
  cnicBackUrl: string | null;
  nomineeName: string | null;
  nomineeRelation: string | null;
  nomineeCnic: string | null;
  nomineeMobile: string | null;
  declarationAccepted: boolean;
  createdAt: string | null;
  status: string;
}

interface InventoryProfit {
  id: string;
  inventoryPrice: number;
  totalPrice: number;
  customerUnit: number;
  paymentMethod: string;
  accountNumber: string | null;
  plan: string;
  accountHolderName: string | null;
  date: string;
  profitDate: string;
  status: string;
}

interface Transaction {
  id: string;
  calculatedAmount: number;
  transactionNumber: string;
  remarks: string;
  date: string;
  plan: string;
}

export default function UserTransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [applications, setApplications] = useState<FormApplication[]>([]);
  const [inventoryDetails, setInventoryDetails] = useState<InventoryProfit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Pagination state for transactions table
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Date formatting helper function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUserData(parsedUser);

    const targetCnic = parsedUser.cnic;
    if (!targetCnic) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user/transactions?cnic=${targetCnic}`);
        const result = await res.json();

        if (result.success) {
          setApplications(result.data.applicationDetails || []);
          setInventoryDetails(result.data.inventoryDetails || []);
          setTransactions(result.data.transactions || []);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkmode">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 sm:px-8 bg-light dark:bg-darkmode text-dark dark:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Unified Card for Complete Applicant Details */}
        <div className="bg-white dark:bg-semidark p-6 sm:p-8 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-extrabold mb-2">My Account & Application Details</h1>
            <p className="text-sm text-gray-500">Complete record from form applications and active investment plans.</p>
          </div>

          {/* Form Applications Data - Showing ALL Fields */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border dark:border-dark_border pb-2">Full Application Record</h2>
            {applications.length === 0 ? (
              <p className="text-gray-400 text-sm">No form application found for this CNIC.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-5 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/20 space-y-4 text-sm">
                  
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                    <div><span className="text-gray-400 font-medium">Name :</span> <span className="font-bold text-base ml-2">{app.fullName}</span></div>
                    <div><span className="text-gray-400 font-medium">Application Number :</span> <span className="font-mono font-semibold ml-2">{app.appNo}</span></div>
                    
                    <div><span className="text-gray-400 font-medium">Father Name :</span> <span className="font-semibold ml-2">{app.fatherName}</span></div>
                    <div><span className="text-gray-400 font-medium">CNIC :</span> <span className="font-semibold ml-2">{app.cnic}</span></div>

                    <div><span className="text-gray-400 font-medium">Date of Birth :</span> <span className="ml-2">{formatDate(app.dob || "")}</span></div>
                    <div><span className="text-gray-400 font-medium">Application Date :</span> <span className="ml-2">{formatDate(app.date)}</span></div>

                    <div><span className="text-gray-400 font-medium">Mobile :</span> <span className="font-semibold ml-2">{app.mobile}</span></div>
                    <div><span className="text-gray-400 font-medium">Alternate Contact :</span> <span className="ml-2">{app.altContact || "N/A"}</span></div>

                    <div className="md:col-span-2"><span className="text-gray-400 font-medium">Address :</span> <span className="ml-2">{app.address || "N/A"}</span></div>
                    <div><span className="text-gray-400 font-medium">Status :</span> <span className="font-semibold ml-2 text-primary">{app.status}</span></div>
                    <div><span className="text-gray-400 font-medium">Created At :</span> <span className="ml-2">{formatDate(app.createdAt || "")}</span></div>
                  </div>

                  {/* Financial & Household Info */}
                  <div className="pt-3 border-t border-border dark:border-dark_border/50">
                    <h3 className="font-bold text-xs uppercase text-black mb-2">Financial & Household Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* <div><span className="text-gray-400 font-medium">Applicant Income:</span> Rs. {app.applicantIncome?.toLocaleString() || 0}</div> */}
                      <div><span className="text-gray-400 font-medium">Household Income:</span> Rs. {app.householdIncome?.toLocaleString() || 0}</div>
                      <div><span className="text-gray-400 font-medium">Income Type:</span> {app.applicantIncomeType || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Living Arrangement:</span> {app.livingArrangement || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Earning Members:</span> {app.earningMembers || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Dependents:</span> {app.dependents || "N/A"}</div>
                      <div className="md:col-span-3"><span className="text-gray-400 font-medium">Participation Amount:</span> Rs. {app.participationAmount?.toLocaleString() || 0}</div>
                      <div className="md:col-span-3"><span className="text-gray-400 font-medium">Categories:</span> {app.categories || "N/A"}</div>
                    </div>
                  </div>

                  {/* Nominee Details */}
                  <div className="pt-3 border-t border-border dark:border-dark_border/50">
                    <h3 className="font-bold text-xs uppercase text-black mb-2">Nominee Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><span className="text-gray-400 font-medium">Nominee Name :</span> {app.nomineeName || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Nominee Relation :</span> {app.nomineeRelation || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Nominee CNIC :</span> {app.nomineeCnic || "N/A"}</div>
                      <div><span className="text-gray-400 font-medium">Nominee Mobile :</span> {app.nomineeMobile || "N/A"}</div>
                    </div>
                  </div>

                  {/* Documents & Declaration Links / Status */}
        {/* Images Preview Section */}
<div className="pt-3 border-t border-border dark:border-dark_border/50 flex flex-wrap gap-4 items-center">
  <div>
    <span className="text-gray-400 font-medium block text-xs mb-1">Declaration Accepted:</span> 
    <span className={app.declarationAccepted ? "text-green-600 font-bold text-sm" : "text-red-500 font-bold text-sm"}>
      {app.declarationAccepted ? "Yes" : "No"}
    </span>
  </div>

  {app.photoUrl && (
    <div>
      <span className="text-gray-400 font-medium block text-xs mb-1">Profile Photo</span>
      <img 
        src={app.photoUrl} 
        alt="Profile" 
        className="w-16 h-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-85 transition" 
        onClick={() => setSelectedImage(app.photoUrl)} 
      />
    </div>
  )}

  {app.cnicFrontUrl && (
    <div>
      <span className="text-gray-400 font-medium block text-xs mb-1">CNIC Front</span>
      <img 
        src={app.cnicFrontUrl} 
        alt="CNIC Front" 
        className="w-24 h-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-85 transition" 
        onClick={() => setSelectedImage(app.cnicFrontUrl)} 
      />
    </div>
  )}

  {app.cnicBackUrl && (
    <div>
      <span className="text-gray-400 font-medium block text-xs mb-1">CNIC Back</span>
      <img 
        src={app.cnicBackUrl} 
        alt="CNIC Back" 
        className="w-24 h-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-85 transition" 
        onClick={() => setSelectedImage(app.cnicBackUrl)} 
      />
    </div>
  )}
</div>

                </div>
              ))
            )}
          </div>
{/* Image Preview Modal */}
{selectedImage && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    onClick={() => setSelectedImage(null)}
  >
    <div className="relative max-w-4xl max-h-[90vh]">
      <button 
        className="absolute -top-10 right-0 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-700 transition"
        onClick={() => setSelectedImage(null)}
      >
        &times;
      </button>
      <img 
        src={selectedImage} 
        alt="Enlarged Preview" 
        className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl" 
      />
    </div>
  </div>
)}
          {/* Investment & Payment Information */}
          <div className="mt-6 pt-6 border-t border-border dark:border-dark_border">
            <h2 className="text-xl font-bold mb-4">Investment & Payment Method Details</h2>
            {inventoryDetails.length === 0 ? (
              <p className="text-gray-400 text-sm">No active inventory or payment details found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventoryDetails.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-border dark:border-dark_border bg-gray-50 dark:bg-black/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-primary">{item.plan} Plan</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-400">Units:</span> {item.customerUnit}</p>
                      <p><span className="text-gray-400">Total Price:</span> Rs. {item.totalPrice.toLocaleString()}</p>
                      <p><span className="text-gray-400">Payment Method:</span> <span className="font-medium uppercase text-blue-600 dark:text-blue-400">{item.paymentMethod}</span></p>
                      {item.accountNumber && <p><span className="text-gray-400">Account Number:</span> <span className="font-mono">{item.accountNumber}</span></p>}
                      {item.accountHolderName && <p><span className="text-gray-400">Account Holder:</span> {item.accountHolderName}</p>}
                      <p><span className="text-gray-400">Investment Date:</span> {formatDate(item.date)}</p>
                      <p><span className="text-gray-400">Rent Date:</span> <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatDate(item.profitDate)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History DataGrid with Pagination */}
        <div className="bg-white dark:bg-semidark p-6 sm:p-8 rounded-2xl shadow-lg border border-border dark:border-dark_border">
          <h2 className="text-xl font-bold mb-4">Profit Payout Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transaction records found yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-dark_border text-gray-400 uppercase text-xs">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Transaction / Slip #</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border dark:border-dark_border hover:bg-gray-50 dark:hover:bg-black/10 transition">
                        <td className="py-3 px-4">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4 font-medium">{tx.plan}</td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400 font-bold">Rs. {tx.calculatedAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-xs">{tx.transactionNumber}</td>
                        <td className="py-3 px-4 text-gray-500">{tx.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border dark:border-dark_border text-sm">
                  <span className="text-gray-400">
                    Showing page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-black/30 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-black/50 transition font-medium"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-black/30 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-black/50 transition font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}