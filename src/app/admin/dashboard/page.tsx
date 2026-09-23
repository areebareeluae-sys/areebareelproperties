"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';

export default function HODDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    stats: {
      applications: { total: 0, completed: 0, pending: 0, rejected: 0 },
      properties: { total: 0, active: 0 },
      transactions: { totalCount: 0, totalAmount: 0 },
      inventoryProfit: { totalActive: 0, totalDeactive: 0, totalPriceSum: 0 }
    },
    inventoryProfits: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // 1. Auth Check from Local Storage
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

  // 2. Fetch Data from Dashboard API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard`);
      if (!res.ok) throw new Error("Failed to load dashboard data.");
      const data = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading && !dashboardData.stats.applications.total) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkmode">
        <p className="text-black dark:text-white text-lg font-medium">Loading Executive Dashboard...</p>
      </div>
    );
  }

  // Calculate percentages for graphical application summary bar
  const totalApps = dashboardData.stats.applications.total || 1;
  const compPct = Math.round((dashboardData.stats.applications.completed / totalApps) * 100);
  const pendPct = Math.round((dashboardData.stats.applications.pending / totalApps) * 100);
  const rejPct = Math.round((dashboardData.stats.applications.rejected / totalApps) * 100);

  // Pagination Logic for inventoryProfits
  const allProfits = dashboardData.inventoryProfits || [];
  const totalPages = Math.ceil(allProfits.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = allProfits.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col items-center justify-center text-center py-6 px-4">
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
            Executive Management Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Welcome back, <span className="font-bold text-primary">{user?.name}</span> &bull; System Analytics
          </p>
          <button 
            onClick={fetchDashboardData}
            className="mt-5 bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-80 transition"
          >
            Refresh Analytics
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span>{error}</span>
          </div>
        )}

        {/* TOP METRICS & GRAPHICAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Applications Report Card */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-black dark:border-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-500 uppercase">Applications</span>
                <span className="text-lg font-black text-black dark:text-white">{dashboardData.stats.applications.total}</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full mt-4 overflow-hidden flex">
                <div style={{ width: `${compPct}%` }} className="bg-green-500 h-full" title="Completed"></div>
                <div style={{ width: `${pendPct}%` }} className="bg-yellow-500 h-full" title="Pending"></div>
                <div style={{ width: `${rejPct}%` }} className="bg-red-500 h-full" title="Rejected"></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[11px] font-bold text-gray-500">
              <span className="text-green-600">Comp: {dashboardData.stats.applications.completed}</span>
              <span className="text-yellow-600">Pend: {dashboardData.stats.applications.pending}</span>
              <span className="text-red-600">Rej: {dashboardData.stats.applications.rejected}</span>
            </div>
          </div>

          {/* 2. Properties Report Card */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-blue-600 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-blue-600 uppercase">Properties</span>
                <span className="text-lg font-black text-black dark:text-white">{dashboardData.stats.properties.total}</span>
              </div>
              <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Active Listings</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-300">{dashboardData.stats.properties.active}</span>
              </div>
            </div>
            <div className="mt-4 text-[11px] text-gray-500 font-medium">
              Real estate portfolio status overview
            </div>
          </div>

          {/* 3. Transaction History Report Card */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-purple-600 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-purple-600 uppercase">Transactions</span>
                <span className="text-lg font-black text-black dark:text-white">{dashboardData.stats.transactions.totalCount}</span>
              </div>
              <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl">
                <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Total Volume</span>
                <span className="text-sm font-black text-purple-700 dark:text-purple-300">Rs. {dashboardData.stats.transactions.totalAmount.toLocaleString('en-PK')}</span>
              </div>
            </div>
            <div className="mt-4 text-[11px] text-gray-500 font-medium">
              Cash transfer records volume
            </div>
          </div>

          {/* 4. Inventory Profit Report Card */}
          <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-green-600 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-green-600 uppercase">Inventory Profit</span>
                <span className="text-lg font-black text-black dark:text-white">
                  {dashboardData.stats.inventoryProfit.totalActive + dashboardData.stats.inventoryProfit.totalDeactive}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                  <span className="block text-[10px] text-green-600 font-bold uppercase">Active</span>
                  <span className="text-sm font-black text-green-700">{dashboardData.stats.inventoryProfit.totalActive}</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-center">
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Deactive</span>
                  <span className="text-sm font-black text-gray-700 dark:text-gray-300">{dashboardData.stats.inventoryProfit.totalDeactive}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px]">
  <span className="text-gray-500 font-medium">
    Total Units: <strong className="text-black dark:text-white">{dashboardData.stats.inventoryProfit.totalPriceSum / 100000}</strong>
  </span>
  <strong className="text-green-600 text-xs">
    Rs. {dashboardData.stats.inventoryProfit.totalPriceSum.toLocaleString('en-PK')}
  </strong>

            </div>
          </div>

        </div>

        {/* CUSTOMER UNITS & MALIYAT BREAKDOWN WITH CNIC & PAGINATION */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md">
          <h3 className="text-sm font-extrabold text-black dark:text-white uppercase mb-4 tracking-wider">
            Customer Units & Maliyat Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase">
                  <th className="py-3 px-4">Customer id</th>
                  <th className="py-3 px-4">Customer CNIC</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Units (CustomerUnit)</th>
                  <th className="py-3 px-4">Maliyat (Price)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                {currentRows.length > 0 ? (
                  currentRows.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-bold">{item.cnic}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">{item.cnic}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.propertyTitle}</td>
                      <td className="py-3 px-4 font-black text-blue-600">{item.customerUnit} Units</td>
                      <td className="py-3 px-4 font-bold text-green-600">Rs. {item.calculatedPrice.toLocaleString('en-PK')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-400">No inventory profit records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentPage === page ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}