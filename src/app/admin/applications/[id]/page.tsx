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

  // Action Modal states (Forward / Reject ke liye)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [actionType, setActionType] = useState<string>(""); 
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // View Details Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewApp, setViewApp] = useState<any>(null);

  // Image Preview Modal states (Bara dekhne ke liye)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cloudinary Helper Function
  const getCloudinaryUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `https://res.cloudinary.com/y556pcib/image/upload/${imagePath}`;
  };

  // 1. User details local storage se read karna
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

  // 2. Applications fetch karne ka function
  const fetchApplications = async (currentUser: any) => {
    try {
      setLoading(true);
      const isHod = currentUser?.email === 'hod@chiron.com' || currentUser?.userRole === 'hod';
      
      const departmentQuery = (!isHod && currentUser?.departmentId) 
        ? `?departmentId=${encodeURIComponent(currentUser.departmentId)}` 
        : "";

      const res = await fetch(`/api/adminaction${departmentQuery}`);
      
      if (!res.ok) {
        throw new Error("Applications data load karne mein nakami hui.");
      }

      const data = await res.json();
      setApplications(data.applications || data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Kuch masla ho gaya hai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications(user);
    }
  }, [user]);

  // 3. View Modal Open karne ke liye
  const handleViewDetails = (app: any) => {
    setViewApp(app);
    setIsViewModalOpen(true);
  };

  // 4. Action Modal Open karne ke liye
  const openActionModal = (app: any, type: string) => {
    setSelectedApp(app);
    setActionType(type);
    setRemarks("");
    setIsModalOpen(true);
  };

  // 5. Action Submit karne ke liye (API Call)
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
          currentDeptId: user.departmentId || selectedApp.currentDepartmentId,
          officeUserId: user.id,
          actionType: actionType, 
          remarks: remarks
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Action perform karne mein masla aaya.');
      }

      toast.success(data.message || 'Application successfully process ho gayi!');
      setIsModalOpen(false);
      fetchApplications(user);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Kuch galat ho gaya.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkmode">
        <p className="text-dark dark:text-white text-lg font-medium">Applications load ho rahi hain...</p>
      </div>
    );
  }

  const isHodUser = user?.email === 'hod@chiron.com' || user?.userRole === 'hod';

  // Helper variables for Images using schema columns
  const profileImgSrc = getCloudinaryUrl(viewApp?.photoUrl);
  const frontImgSrc = getCloudinaryUrl(viewApp?.cnicFrontUrl || viewApp?.cnicFront || viewApp?.frontImage);
  const backImgSrc = getCloudinaryUrl(viewApp?.cnicBackUrl || viewApp?.cnicBack || viewApp?.backImage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              {isHodUser ? "HOD Dashboard - All Applications" : "Department Applications"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Logged in as: <span className="font-semibold text-primary">{user?.name}</span> ({user?.email}) | Mode: <span className="font-semibold text-primary">{isHodUser ? "Full Access (HOD)" : `Department ID: ${user?.departmentId}`}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-semidark shadow-md rounded-lg overflow-hidden border border-border dark:border-dark_border">
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Koi application mojood nahi hai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border dark:divide-dark_border">
                <thead className="bg-gray-50 dark:bg-dark_border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Application ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service / Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Dept</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-dark_border">
                  {applications.map((app: any, index: number) => (
                    <tr key={app.id || index} className="hover:bg-gray-50 dark:hover:bg-dark_border/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark dark:text-white">
                        {app.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark dark:text-white">
                        <div className="flex items-center space-x-3">
                          {app.photoUrl ? (
                            <img 
                              src={getCloudinaryUrl(app.photoUrl)} 
                              alt="Profile" 
                              className="w-8 h-8 rounded-full object-cover border border-border" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark_border flex items-center justify-center text-xs font-bold text-gray-500">
                              {(app.clientName || app.fullName || "U")[0]}
                            </div>
                          )}
                          <span>{app.clientName || app.fullName || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {app.serviceType || app.type || "General"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          {app.currentDepartmentId || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          app.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewDetails(app)}
                          className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:opacity-90 transition shadow-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => openActionModal(app, 'FORWARD')}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-green-700 transition shadow-sm"
                        >
                          Accept / Forward
                        </button>
                        <button 
                          onClick={() => openActionModal(app, 'REJECTED')}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-700 transition shadow-sm"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-semidark rounded-xl max-w-2xl w-full shadow-2xl border border-border dark:border-dark_border flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border dark:border-dark_border flex justify-between items-center bg-gray-50 dark:bg-dark_border/50">
              <div className="flex items-center space-x-3">
                {profileImgSrc ? (
                  <img 
                    src={profileImgSrc} 
                    alt="Applicant Photo" 
                    onClick={() => setPreviewImage(profileImgSrc)}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary cursor-pointer hover:scale-105 transition"
                    title="Click to view profile picture"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {(viewApp.fullName || viewApp.clientName || "U")[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-dark dark:text-white">
                    {viewApp.fullName || viewApp.clientName || "Application Details"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {viewApp.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-dark dark:hover:text-white font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-dark_border/20 p-4 rounded-lg border border-border dark:border-dark_border">
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Application ID</span>
                  <span className="text-sm font-medium text-dark dark:text-white">{viewApp.id}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Client Name</span>
                  <span className="text-sm font-medium text-dark dark:text-white">{viewApp.clientName || viewApp.fullName || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Service / Type</span>
                  <span className="text-sm font-medium text-dark dark:text-white">{viewApp.serviceType || viewApp.type || "General"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Current Department</span>
                  <span className="text-sm font-medium text-dark dark:text-white">{viewApp.currentDepartmentId || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {viewApp.status || "Pending"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Submission Date</span>
                  <span className="text-sm font-medium text-dark dark:text-white">{viewApp.createdAt ? new Date(viewApp.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>

              {/* Categories Display Section */}
        {/* Categories Display Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Selected Categories</h4>
                <div className="bg-gray-50 dark:bg-dark_border/20 p-4 rounded-lg border border-border dark:border-dark_border">
                  <span className="text-sm text-dark dark:text-white font-medium">
                    {(() => {
                      // Dynamically find any key that looks like category if 'categories' is missing
                      const catKey = Object.keys(viewApp || {}).find(k => 
                        k.toLowerCase().includes('categor') || k.toLowerCase() === 'cat'
                      );
                      const val = catKey ? viewApp[catKey] : viewApp?.categories;

                      if (!val) return "No categories selected";

                      try {
                        let parsed = typeof val === 'string' ? JSON.parse(val) : val;
                        if (typeof parsed === 'string') {
                          parsed = JSON.parse(parsed);
                        }
                        if (Array.isArray(parsed)) {
                          return parsed.join(', ');
                        }
                        return String(parsed);
                      } catch (e) {
                        return String(val);
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Other Fields List */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Additional Information</h4>
                <div className="divide-y divide-border dark:divide-dark_border border rounded-lg overflow-hidden">
                  {Object.entries(viewApp).map(([key, value]) => {
                    if (['id', 'clientName', 'fullName', 'serviceType', 'type', 'currentDepartmentId', 'status', 'createdAt', 'cnicFrontUrl', 'cnicBackUrl', 'cnicFront', 'cnicBack', 'photoUrl', 'categories'].includes(key)) return null;
                    return (
                      <div key={key} className="flex justify-between px-4 py-3 text-sm bg-white dark:bg-semidark">
                        <span className="font-medium text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-dark dark:text-white text-right font-medium">{String(value ?? "N/A")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CNIC Images Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">CNIC Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CNIC Front */}
                  <div className="border border-border dark:border-dark_border rounded-lg p-3 bg-gray-50 dark:bg-dark_border/20 text-center">
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">CNIC Front Side</span>
                    {frontImgSrc ? (
                      <div 
                        onClick={() => setPreviewImage(frontImgSrc)}
                        className="cursor-pointer overflow-hidden rounded-md border border-border dark:border-dark_border h-36 bg-gray-200 dark:bg-dark_border flex items-center justify-center relative group"
                      >
                        <img 
                          src={frontImgSrc} 
                          alt="CNIC Front" 
                          className="object-cover h-full w-full group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                          Click to Zoom
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center border border-dashed border-border rounded-md text-xs text-gray-400">
                        No Front Image Uploaded
                      </div>
                    )}
                  </div>

                  {/* CNIC Back */}
                  <div className="border border-border dark:border-dark_border rounded-lg p-3 bg-gray-50 dark:bg-dark_border/20 text-center">
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">CNIC Back Side</span>
                    {backImgSrc ? (
                      <div 
                        onClick={() => setPreviewImage(backImgSrc)}
                        className="cursor-pointer overflow-hidden rounded-md border border-border dark:border-dark_border h-36 bg-gray-200 dark:bg-dark_border flex items-center justify-center relative group"
                      >
                        <img 
                          src={backImgSrc} 
                          alt="CNIC Back" 
                          className="object-cover h-full w-full group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                          Click to Zoom
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center border border-dashed border-border rounded-md text-xs text-gray-400">
                        No Back Image Uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border dark:border-dark_border bg-gray-50 dark:bg-dark_border/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-dark_border text-dark dark:text-white hover:opacity-80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
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
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* ACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-semidark rounded-xl p-6 max-w-md w-full shadow-xl border border-border dark:border-dark_border">
            <h3 className="text-lg font-bold text-dark dark:text-white mb-4">
              {actionType === 'FORWARD' ? 'Accept & Forward Application' : 'Reject Application'}
            </h3>
            
            <form onSubmit={handleActionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Review / Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Yahan apne review remarks likhein..."
                  className="w-full rounded-md border border-border dark:border-dark_border bg-transparent p-3 text-dark dark:text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-dark_border text-dark dark:text-white hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-md text-sm text-white ${
                    actionType === 'FORWARD' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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