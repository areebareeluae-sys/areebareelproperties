"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';

export default function ClientApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchCnic, setSearchCnic] = useState("");
  const [searchAppNo, setSearchAppNo] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Action Modal States (For Forward / Reject)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [actionType, setActionType] = useState<string>(""); 
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
const [viewMode, setViewMode] = useState<string>("all"); // "all" ya "verification"
  // View Details Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewApp, setViewApp] = useState<any>(null);

  // Image Preview Modal States (For Zooming)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cloudinary Helper Function
  const getCloudinaryUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `https://res.cloudinary.com/y556pcib/image/upload/${imagePath}`;
  };

  // 1. Read User Details from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        router.push("/signin");
      }
    } else {
      router.push("/signin");
    }
  }, [router]);

  // Helper check for Admin / HOD / dept_4
  const checkIsAdminOrHod = (currentUser: any) => {
    return (
      currentUser?.email === 'hod@chiron.com' || 
      currentUser?.userRole === 'hod' || 
      currentUser?.departmentId === 'dept_4'
    );
  };

  // 2. Fetch Applications Function
  const fetchApplications = async (currentUser: any) => {
    try {
      setLoading(true);
      const isHodOrAdmin = checkIsAdminOrHod(currentUser);
      
      const departmentQuery = (!isHodOrAdmin && currentUser?.departmentId) 
        ? `?departmentId=${encodeURIComponent(currentUser.departmentId)}` 
        : "";

      const res = await fetch(`/api/adminaction${departmentQuery}`);
      
      if (!res.ok) {
        throw new Error("Failed to load applications data.");
      }

      const data = await res.json();
      setApplications(data.applications || data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications(user);
    }
  }, [user]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchCnic, searchAppNo, filterStatus]);

  // 3. Open View Details Modal
  const handleViewDetails = (app: any) => {
    setViewApp(app);
    setIsViewModalOpen(true);
  };

  // 4. Open Action Modal
  const openActionModal = (app: any, type: string) => {
    setSelectedApp(app);
    setActionType(type);
    setRemarks("");
    setIsModalOpen(true);
  };

  // 5. Submit Action (API Call)
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !user) return;

    try {
      setActionLoading(true);
      const res = await fetch('/api/adminaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: selectedApp.id,
          currentDeptId: user.departmentId ? String(user.departmentId) : String(selectedApp.currentDepartmentId || ""),
          officeUserId: user.id,
          actionType: actionType, 
          remarks: remarks
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to process the application action.');
      }

      toast.success(data.message || 'Application successfully processed!');
      setIsModalOpen(false);
      fetchApplications(user);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Applications Logic
const filteredApplications = applications.filter((app: any) => {
  const fullName = (app.fullName || app.clientName || "").toLowerCase();
  const cnic = (app.cnic || app.cnicNo || "").toLowerCase();
  const appNo = (app.appNo || app.applicationNumber || "").toLowerCase();
  const status = (app.status || "Pending").toLowerCase();

  const matchesName = fullName.includes(searchName.toLowerCase());
  const matchesCnic = cnic.includes(searchCnic.toLowerCase());
  const matchesAppNo = appNo.includes(searchAppNo.toLowerCase());
  const matchesStatus = filterStatus === "ALL" || status === filterStatus.toLowerCase();
// Naya state add karein baqi states ke sath:

  // View Mode Filter (All vs Verification Dept-4)
  let matchesViewMode = true;
  if (viewMode === "verification") {
    // Yahan check karein ke application dept_4 ki hai ya current department dept_4 hai
    matchesViewMode = (app.currentDepartmentId === 'dept_4' || app.departmentId === 'dept_4');
  }

  return matchesName && matchesCnic && matchesAppNo && matchesStatus && matchesViewMode;
});
  // Pagination Logic
  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredApplications.slice(indexOfFirstRow, indexOfLastRow);

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkmode">
        <p className="text-dark dark:text-white text-lg font-medium">Loading applications...</p>
      </div>
    );
  }

  const isHodUser = checkIsAdminOrHod(user);

  const profileImgSrc = getCloudinaryUrl(viewApp?.photoUrl);
  const frontImgSrc = getCloudinaryUrl(viewApp?.cnicFrontUrl || viewApp?.cnicFront || viewApp?.frontImage);
  const backImgSrc = getCloudinaryUrl(viewApp?.cnicBackUrl || viewApp?.cnicBack || viewApp?.backImage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center justify-center text-center py-6 px-4">
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
            {isHodUser ? "HOD / Admin Dashboard - All Applications" : "Department Applications Portal"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Logged in as: <span className="font-bold text-primary">{user?.name}</span> ({user?.email}) &bull; Mode: <span className="font-bold text-primary">{isHodUser ? "Full Access (Admin/HOD)" : `Department ID: ${user?.departmentId}`}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

{/* --- VIEW MODE TOGGLE BUTTONS (YAHAN LAGA DEIN) --- */}
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 text-xs font-bold rounded-lg border border-black transition ${
              viewMode === "all" 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "bg-white text-black dark:bg-semidark dark:text-white"
            }`}
          >
            All Department Applications
          </button>
          <button
            onClick={() => setViewMode("verification")}
            className={`px-4 py-2 text-xs font-bold rounded-lg border border-black transition ${
              viewMode === "verification" 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "bg-white text-black dark:bg-semidark dark:text-white"
            }`}
          >
            Verification (Dept-4)
          </button>
        </div>

        {/* FILTER & SEARCH SECTION */}
        <div className="bg-white dark:bg-semidark p-5 rounded-xl shadow-md border border-black dark:border-dark_border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-black dark:text-white uppercase mb-1">Search by Name</label>
            <input 
              type="text" 
              placeholder="e.g. Talha Mehmood" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-black dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black dark:text-white uppercase mb-1">Search by CNIC</label>
            <input 
              type="text" 
              placeholder="e.g. 33330-3333278-9" 
              value={searchCnic}
              onChange={(e) => setSearchCnic(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-black dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black dark:text-white uppercase mb-1">Search by App No</label>
            <input 
              type="text" 
              placeholder="e.g. HISA-00001" 
              value={searchAppNo}
              onChange={(e) => setSearchAppNo(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-black dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black dark:text-white uppercase mb-1">Filter by Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-black dark:border-dark_border bg-white dark:bg-darkmode text-black dark:text-white outline-none focus:ring-2 focus:ring-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Accepted">Accepted</option>
              <option value="Forwarded">Forwarded</option>
            </select>
          </div>
        </div>
        {/* APPLICATIONS TABLE SECTION */}
        <div className="bg-white dark:bg-semidark shadow-lg rounded-xl overflow-hidden border border-black dark:border-dark_border">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium">No applications match your search or filter criteria.</p>
            </div>
          ) : (
            <>
            
              <div className="overflow-x-auto">
                
                <table className="w-full divide-y divide-black dark:divide-dark_border table-fixed">
                  <thead className="bg-gray-100 dark:bg-dark_border">
                    <tr>
                      <th className="w-[110px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Created At</th>
                      <th className="w-[130px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">ID</th>
                      <th className="w-[110px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">App No</th>
                      <th className="w-[180px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Full Name</th>
                      <th className="w-[130px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Participation</th>
                      <th className="w-[140px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">CNIC</th>
                      <th className="w-[110px] px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                      <th className="w-[200px] px-3 py-3 text-right text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark_border">
                    {currentRows.map((app: any, index: number) => (
                    <tr key={app.id || index} className="hover:bg-gray-50 dark:hover:bg-dark_border/50 transition">
  <td className="w-[110px] px-3 py-4 text-xs text-gray-700 dark:text-gray-300 truncate" title={app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}>
    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
  </td>
  <td className="w-[130px] px-3 py-4 text-xs font-bold text-black dark:text-white truncate" title={app.id}>
    {app.id}
  </td>
  <td className="w-[110px] px-3 py-4 text-xs font-semibold text-black dark:text-white truncate" title={app.appNo || app.applicationNumber}>
    {app.appNo || app.applicationNumber || "N/A"}
  </td>
  <td className="w-[180px] px-3 py-4 text-xs text-black dark:text-white font-medium truncate">
    <div className="flex items-center space-x-2">
      {app.photoUrl ? (
        <img 
          src={getCloudinaryUrl(app.photoUrl)} 
          alt="Profile" 
          className="w-6 h-6 flex-shrink-0 rounded-full object-cover border border-black" 
        />
      ) : null}
      <span className="truncate" title={app.fullName || app.clientName}>{app.fullName || app.clientName || "N/A"}</span>
    </div>
  </td>
  <td className="w-[130px] px-3 py-4 text-xs font-semibold text-black dark:text-white truncate" title={app.participationAmount ? `Rs. ${Number(app.participationAmount).toLocaleString('en-PK')}` : ""}>
    {app.participationAmount ? `Rs. ${Number(app.participationAmount).toLocaleString('en-PK')}` : "N/A"}
  </td>
  <td className="w-[140px] px-3 py-4 text-xs text-gray-700 dark:text-gray-300 truncate" title={app.cnic || app.cnicNo}>
    {app.cnic || app.cnicNo || "N/A"}
  </td>
  <td className="w-[110px] px-3 py-4 text-xs truncate">
    <span className="px-2 py-0.5 inline-flex text-[10px] font-bold rounded border border-black bg-white text-black truncate max-w-full" title={app.status || 'Pending'}>
      {app.status || 'Pending'}
    </span>
  </td>
  <td className="w-[200px] px-3 py-4 text-right text-xs font-medium space-x-1 whitespace-nowrap">
    {/* View Button: Completed, Pending, Forwarded, Closed par show hoga (Rejected par nahi) */}
    {['completed', 'pending', 'forwarded', 'close', 'closed'].includes((app.status || 'pending').toLowerCase()) && (
      <button 
        onClick={() => handleViewDetails(app)}
        className="bg-black text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-gray-800 transition shadow-sm"
      >
        View
      </button>
    )}

    {/* Accept Button: Pending, Forwarded, aur Rejected par show hoga */}
    {['pending', 'forwarded', 'rejected'].includes((app.status || 'pending').toLowerCase()) && (
      <button 
        onClick={() => openActionModal(app, 'FORWARD')}
        className="bg-green-700 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-green-800 transition shadow-sm"
      >
        Accept
      </button>
    )}

    {/* Reject Button: Completed, Pending, Forwarded, aur Rejected par show hoga */}
    {['completed', 'pending', 'forwarded', 'rejected'].includes((app.status || 'pending').toLowerCase()) && (
      <button 
        onClick={() => openActionModal(app, 'REJECTED')}
        className="bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-red-800 transition shadow-sm"
      >
        Reject
      </button>
    )}
  </td>
</tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 dark:bg-dark_border border-t border-black dark:border-dark_border gap-4">
                <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Showing <span className="font-bold text-black dark:text-white">{indexOfFirstRow + 1}</span> to <span className="font-bold text-black dark:text-white">{Math.min(indexOfLastRow, filteredApplications.length)}</span> of <span className="font-bold text-black dark:text-white">{filteredApplications.length}</span> entries
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold rounded border border-black bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
                  >
                    Previous
                  </button>

                  <div className="text-xs font-bold text-black dark:text-white px-2">
                    Page {currentPage} of {totalPages || 1}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 text-xs font-bold rounded border border-black bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black rounded-xl max-w-2xl w-full shadow-2xl border-2 border-black flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-black flex justify-between items-center bg-gray-100">
              <div className="flex items-center space-x-3">
                {profileImgSrc ? (
                  <img 
                    src={profileImgSrc} 
                    alt="Applicant Photo" 
                    onClick={() => setPreviewImage(profileImgSrc)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-black cursor-pointer hover:scale-105 transition shadow-sm"
                    title="Click to view profile picture"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {(viewApp.fullName || viewApp.clientName || "U")[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-black tracking-wide" title={viewApp.fullName || viewApp.clientName}>
                    {viewApp.fullName || viewApp.clientName || "Application Details"}
                  </h3>
                  <p className="text-xs text-gray-700 font-bold" title={viewApp.id}>ID: {viewApp.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-black hover:opacity-70 font-bold text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 bg-white text-black">
              
              {/* Highlighted Key Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-xl border-2 border-black shadow-sm">
                <div className="bg-white p-3 rounded-lg border border-black shadow-xs">
                  <span className="block text-[11px] text-gray-600 uppercase tracking-wider font-extrabold">Full Name</span>
                  <span className="text-base font-black text-black break-words" title={viewApp.fullName || viewApp.clientName}>
                    {viewApp.fullName || viewApp.clientName || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-black shadow-xs">
                  <span className="block text-[11px] text-gray-600 uppercase tracking-wider font-extrabold">CNIC Number</span>
                  <span className="text-base font-black text-black tracking-wide" title={viewApp.cnic || viewApp.cnicNo}>
                    {viewApp.cnic || viewApp.cnicNo || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-black shadow-xs">
                  <span className="block text-[11px] text-gray-600 uppercase tracking-wider font-extrabold">Participation Amount</span>
                  <span className="text-sm font-extrabold text-black" title={viewApp.participationAmount ? `Rs. ${Number(viewApp.participationAmount).toLocaleString('en-PK')}` : ""}>
                    {viewApp.participationAmount ? `Rs. ${Number(viewApp.participationAmount).toLocaleString('en-PK')}` : "N/A"}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-black shadow-xs">
                  <span className="block text-[11px] text-gray-600 uppercase tracking-wider font-extrabold">Application No</span>
                  <span className="text-sm font-extrabold text-black" title={viewApp.appNo || viewApp.applicationNumber}>
                    {viewApp.appNo || viewApp.applicationNumber || "N/A"}
                  </span>
                </div>
              </div>

              {/* Secondary Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-black">
                <div>
                  <span className="block text-xs text-gray-600 uppercase tracking-wider font-bold">Application ID</span>
                  <span className="text-xs font-semibold text-black break-all" title={viewApp.id}>{viewApp.id}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-600 uppercase tracking-wider font-bold">Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded border border-black bg-white text-black" title={viewApp.status || "Pending"}>
                    {viewApp.status || "Pending"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-600 uppercase tracking-wider font-bold">Submission Date</span>
                  <span className="text-xs font-semibold text-black" title={viewApp.createdAt ? new Date(viewApp.createdAt).toLocaleDateString() : ""}>
                    {viewApp.createdAt ? new Date(viewApp.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              {/* Selected Categories Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-black pb-1">Selected Categories</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-black space-y-2">
                  {(() => {
                    const catKey = Object.keys(viewApp || {}).find(k => 
                      k.toLowerCase().includes('categor') || k.toLowerCase() === 'cat'
                    );
                    const rawVal = catKey ? viewApp[catKey] : viewApp?.categories;

                    if (!rawVal) return <span className="text-sm text-gray-600 font-medium">No categories selected</span>;

                    try {
                      let parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
                      if (typeof parsed === 'string') {
                        parsed = JSON.parse(parsed);
                      }

                      const formatCategoryLabel = (cat: string) => {
                        const lower = cat.toLowerCase();
                        if (lower.includes('disable') || lower.includes('disability')) return "Disabled / Person with Disability";
                        if (lower.includes('senior')) return "Senior Citizen (65 years or above)";
                        if (lower.includes('widow')) return "Widow";
                        if (lower.includes('low') || lower.includes('income')) return "Low Income";
                        return cat;
                      };

                      if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map((cat: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-3 text-sm text-black" title={String(cat)}>
                            <span className="flex-shrink-0 text-black font-extrabold text-base">✓</span>
                            <span className="font-bold">{formatCategoryLabel(String(cat))}</span>
                          </div>
                        ));
                      }
                      return (
                        <div className="flex items-center space-x-3 text-sm text-black" title={String(parsed)}>
                          <span className="flex-shrink-0 text-black font-extrabold text-base">✓</span>
                          <span className="font-bold">{formatCategoryLabel(String(parsed))}</span>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="flex items-center space-x-3 text-sm text-black" title={String(rawVal)}>
                          <span className="flex-shrink-0 text-black font-extrabold text-base">✓</span>
                          <span className="font-bold">{String(rawVal)}</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-black pb-1">Additional Information</h4>
                <div className="divide-y divide-black border border-black rounded-lg overflow-hidden bg-gray-50">
                  {Object.entries(viewApp).map(([key, value]) => {
                    if (['id', 'appNo', 'applicationNumber', 'clientName', 'fullName', 'participationAmount', 'cnic', 'cnicNo', 'status', 'createdAt', 'cnicFrontUrl', 'cnicBackUrl', 'cnicFront', 'cnicBack', 'photoUrl', 'categories'].includes(key)) return null;
                    if (key.toLowerCase().includes('categor') || key.toLowerCase() === 'cat') return null;
                    return (
                      <div key={key} className="flex justify-between px-4 py-3 text-sm">
                        <span className="font-bold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-black text-right font-semibold" title={String(value ?? "N/A")}>{String(value ?? "N/A")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CNIC Documents Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-black uppercase tracking-wider border-b border-black pb-1">CNIC Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CNIC Front */}
                  <div className="border border-black rounded-lg p-3 bg-gray-50 text-center">
                    <span className="block text-xs font-bold text-black mb-2">CNIC Front Side</span>
                    {frontImgSrc ? (
                      <div 
                        onClick={() => setPreviewImage(frontImgSrc)}
                        className="cursor-pointer overflow-hidden rounded-md border border-black h-36 bg-gray-200 flex items-center justify-center relative group"
                        title="Click to zoom image"
                      >
                        <img 
                          src={frontImgSrc} 
                          alt="CNIC Front" 
                          className="object-cover h-full w-full group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          Click to Zoom
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center border border-dashed border-black rounded-md text-xs text-gray-600 font-medium">
                        No Front Image Uploaded
                      </div>
                    )}
                  </div>

                  {/* CNIC Back */}
                  <div className="border border-black rounded-lg p-3 bg-gray-50 text-center">
                    <span className="block text-xs font-bold text-black mb-2">CNIC Back Side</span>
                    {backImgSrc ? (
                      <div 
                        onClick={() => setPreviewImage(backImgSrc)}
                        className="cursor-pointer overflow-hidden rounded-md border border-black h-36 bg-gray-200 flex items-center justify-center relative group"
                        title="Click to zoom image"
                      >
                        <img 
                          src={backImgSrc} 
                          alt="CNIC Back" 
                          className="object-cover h-full w-full group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          Click to Zoom
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center border border-dashed border-black rounded-md text-xs text-gray-600 font-medium">
                        No Back Image Uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-2 border-black bg-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 rounded-md text-sm font-bold bg-black text-white hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300"
            >
              &times;
            </button>
            <img 
              src={previewImage} 
              alt="Zoomed Preview" 
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl border-2 border-white"
            />
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black rounded-xl p-6 max-w-md w-full shadow-xl border-2 border-black">
            <h3 className="text-lg font-extrabold text-black mb-4">
              {actionType === 'FORWARD' ? 'Accept & Forward Application' : 'Reject Application'}
            </h3>
            
            <form onSubmit={handleActionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-black mb-2">
                  Review / Remarks <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Type your review remarks here..."
                  className="w-full rounded-md border-2 border-black bg-white p-3 text-black outline-none focus:ring-1 focus:ring-black text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-bold bg-gray-200 text-black hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-md text-sm font-bold text-white ${
                    actionType === 'FORWARD' ? 'bg-black hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}