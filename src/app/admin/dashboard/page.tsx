"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';

export default function HODDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [dashboardData, setDashboardData] = useState<any>({
    stats: {
      applications: { total: 0, completed: 0, pending: 0, rejected: 0 },
      properties: { total: 0, active: 0, inactive: 0, list: [] },
      inventory: { total: 0, active: 0, inactive: 0, totalUnits: 0, activeUnits: 0, soldUnits: 0, list: [], plans: {} },
      transactions: { totalCount: 0, totalAmount: 0, list: [] },
      cashFlow: { cashIn: 0, cashSend: 0, logs: [] },
      activityLogs: [],
      usersCount: { staff: 0, clients: 0, staffList: [], clientList: [] }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeModal, setActiveModal] = useState<string | null>(null); 
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const rowsPerModalPage = 10;

  // Helper function to extract and format date properly
  const formatDate = (item: any) => {
    const rawDate = item?.date || item?.createdAt || item?.created_at || item?.timestamp || item?.updatedAt;
    if (!rawDate) return 'N/A';
    try {
      const d = new Date(rawDate);
      return isNaN(d.getTime()) ? rawDate.split('T')[0] : d.toISOString().split('T')[0];
    } catch (e) {
      return rawDate;
    }
  };

  const formatDateTime = (item: any) => {
    const rawDate = item?.date || item?.createdAt || item?.created_at || item?.timestamp || item?.updatedAt;
    if (!rawDate) return 'N/A';
    try {
      const d = new Date(rawDate);
      return isNaN(d.getTime()) ? rawDate : d.toLocaleString();
    } catch (e) {
      return rawDate;
    }
  };

  // Helper to sort any list by latest date descending
  const sortLatestFirst = (list: any[]) => {
    if (!list || !Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const dateA = new Date(a?.date || a?.createdAt || a?.created_at || a?.timestamp || a?.updatedAt || 0).getTime();
      const dateB = new Date(b?.date || b?.createdAt || b?.created_at || b?.timestamp || b?.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        router.push("/signin");
      }
    } else {
      router.push("/signin");
    }
  }, [router]);

  const fetchDashboardData = async (start: string, end: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?startDate=${start}&endDate=${end}`);
      if (!res.ok) throw new Error("Failed to load dashboard data.");
      const data = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData(startDate, endDate);
    }
  }, [user, startDate, endDate]);

  if (loading && !dashboardData.stats.applications.total) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkmode">
        <p className="text-black dark:text-white text-lg font-medium">Loading Executive Dashboard...</p>
      </div>
    );
  }

  const stats = dashboardData.stats;

  const getPaginatedData = (list: any[]) => {
    const sortedList = sortLatestFirst(list);
    const filtered = sortedList.filter((item: any) => {
      const query = searchQuery.toLowerCase();
      return (
        item.property_title?.toLowerCase().includes(query) ||
        item.customerName?.toLowerCase().includes(query) ||
        item.cnic?.includes(query) ||
        item.transactionNumber?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.action?.toLowerCase().includes(query) ||
        item.remarks?.toLowerCase().includes(query)
      );
    });
    const totalPages = Math.ceil(filtered.length / rowsPerModalPage) || 1;
    const startIndex = (modalPage - 1) * rowsPerModalPage;
    const paginatedRows = filtered.slice(startIndex, startIndex + rowsPerModalPage);
    return { filtered, totalPages, paginatedRows };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & DATE RANGE FILTER */}
        <div className="flex flex-col lg:flex-row items-center justify-between bg-white dark:bg-semidark p-6 rounded-2xl shadow-md gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Executive Management Dashboard
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, <span className="font-bold text-primary">{user?.name}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase">From:</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-100 dark:bg-darkmode border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-black dark:text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase">To:</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-100 dark:bg-darkmode border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-black dark:text-white outline-none"
              />
            </div>
            <button 
              onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }}
              className="bg-black text-white dark:bg-white dark:text-black px-3 py-2 rounded-xl text-xs font-bold hover:opacity-80 transition"
            >
              Today
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span>{error}</span>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => { setActiveModal('properties'); setModalPage(1); }}
            className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-blue-600 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase">Properties</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-black text-black dark:text-white">{stats.properties.total}</span>
                <span className="text-[11px] text-blue-600 font-bold">Active: {stats.properties.active}</span>
              </div>
            </div>
            <span className="mt-4 text-[10px] text-gray-400 font-medium">Click to view all properties &rarr;</span>
          </div>

          <div 
            onClick={() => { setActiveModal('inventory'); setModalPage(1); }}
            className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-amber-500 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-extrabold text-amber-600 uppercase">Inventory Units (1 Unit = 1Lakh)</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-black text-black dark:text-white">{stats.inventory.totalUnits} Units</span>
                <span className="text-[11px] text-amber-600 font-bold">Avail: {stats.inventory.activeUnits} | Sold: {stats.inventory.soldUnits}</span>
              </div>
            </div>
            <span className="mt-4 text-[10px] text-gray-400 font-medium">Click to inspect inventory units &rarr;</span>
          </div>

          <div 
            onClick={() => { setActiveModal('transactions'); setModalPage(1); }}
            className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-green-600 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-extrabold text-green-600 uppercase">Transactions Ledger</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-xl font-black text-black dark:text-white">Rs. {stats.transactions.totalAmount.toLocaleString('en-PK')}</span>
                <span className="text-[11px] text-green-600 font-bold">{stats.transactions.totalCount} Txs</span>
              </div>
            </div>
            <span className="mt-4 text-[10px] text-gray-400 font-medium">Click to view ledger &rarr;</span>
          </div>

          <div 
            onClick={() => { setActiveModal('cashFlow'); setModalPage(1); }}
            className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md border-t-4 border-purple-600 cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-extrabold text-purple-600 uppercase">Cash Flow & Activity Logs</span>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-green-600 font-bold">In: {stats.cashFlow.cashIn}</span>
                <span className="text-red-600 font-bold">Send: {stats.cashFlow.cashSend}</span>
              </div>
            </div>
            <span className="mt-4 text-[10px] text-gray-400 font-medium">Click to inspect cash & activity logs &rarr;</span>
          </div>
        </div>

        {/* PLANS BREAKDOWN BAR GRAPH */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
            Investment Plans Unit Distribution (Click Bar to Inspect)
          </h3>
          <div className="space-y-4 pt-2">
            {Object.keys(stats.inventory.plans).length > 0 ? (
              Object.entries(stats.inventory.plans).map(([planName, unitsCount]: [string, any], idx) => {
                const maxUnits = Math.max(...Object.values(stats.inventory.plans) as number[], 10);
                const percentage = Math.min(Math.round((unitsCount / maxUnits) * 100), 100);

                return (
                  <div 
                    key={idx} 
                    onClick={() => { setSelectedPlanFilter(planName); setActiveModal('planDetails'); setModalPage(1); }}
                    className="group cursor-pointer p-4 bg-gray-50 dark:bg-darkmode hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition border border-transparent hover:border-primary/30"
                  >
                    <div className="flex justify-between items-center mb-2 text-xs">
                      <span className="font-extrabold text-black dark:text-white uppercase group-hover:text-primary transition">{planName}</span>
                      <span className="font-black text-primary bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-md">{unitsCount} Units</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-3.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500 group-hover:brightness-110" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400">No active plans assigned yet.</p>
            )}
          </div>
        </div>

        {/* RECENT SYSTEM ACTIVITY LOGS */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-black dark:text-white uppercase tracking-wider">
              Recent System Activity Logs
            </h3>
            <button 
              onClick={() => { setActiveModal('activityLogs'); setModalPage(1); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All Logs &rarr;
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">User / CNIC</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                {stats.activityLogs && stats.activityLogs.length > 0 ? (
                  sortLatestFirst(stats.activityLogs).slice(0, 5).map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-3 text-gray-500 font-medium">{formatDateTime(log)}</td>
                      <td className="py-3 px-3 font-bold text-primary">{log.action || 'N/A'}</td>
                      <td className="py-3 px-3 font-mono">{log.cnic || log.userName || 'System'}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{log.remarks || 'No remarks'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">No recent activity logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* DRILL-DOWN MODALS */}
      {activeModal && (() => {
        const listData = 
          activeModal === 'properties' ? stats.properties.list :
          activeModal === 'inventory' ? stats.inventory.list :
          activeModal === 'transactions' ? stats.transactions.list :
          activeModal === 'cashFlow' ? stats.cashFlow.logs :
          activeModal === 'activityLogs' ? stats.activityLogs : [];

        const { paginatedRows, totalPages } = getPaginatedData(listData);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-semidark w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
              
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-darkmode">
                <h3 className="text-sm font-black uppercase text-black dark:text-white tracking-wider">
                  {activeModal === 'properties' && 'Properties Master List'}
                  {activeModal === 'inventory' && 'Inventory Units Breakdown (1 Unit = Rs. 100,000)'}
                  {activeModal === 'transactions' && 'Transactions Ledger (Date Range)'}
                  {activeModal === 'cashFlow' && 'Internal Cash Logs (In & Out)'}
                  {activeModal === 'planDetails' && `Plan Details: ${selectedPlanFilter}`}
                  {activeModal === 'activityLogs' && 'All Activity Logs'}
                </h3>
                <button 
                  onClick={() => { setActiveModal(null); setSearchQuery(""); setModalPage(1); setSelectedInventoryItem(null); setSelectedPlanFilter(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white font-bold hover:bg-red-500 hover:text-white transition"
                >
                  &times;
                </button>
              </div>

              {/* Specific Inventory Item Customer Breakdown Modal */}
              {selectedInventoryItem ? (
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-darkmode p-4 rounded-xl">
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white">{selectedInventoryItem.property_title}</h4>
                      <p className="text-xs text-gray-500">Total Units: {selectedInventoryItem.totalUnits} | Available: {selectedInventoryItem.availableUnits} | Sold: {selectedInventoryItem.soldUnits}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedInventoryItem(null)}
                      className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-bold"
                    >
                      &larr; Back to Inventory
                    </button>
                  </div>

                  <h5 className="text-xs font-extrabold uppercase text-gray-400">Customers holding units for this item:</h5>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">CNIC</th>
                        <th className="py-2 px-3">Plan</th>
                        <th className="py-2 px-3">Units Assigned</th>
                        <th className="py-2 px-3">Total Investment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                      {selectedInventoryItem.customerDetails && selectedInventoryItem.customerDetails.length > 0 ? (
                        sortLatestFirst(selectedInventoryItem.customerDetails).map((cust: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(cust)}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">{cust.cnic}</td>
                            <td className="py-2.5 px-3 uppercase text-primary font-bold">{cust.plan}</td>
                            <td className="py-2.5 px-3 font-bold">{cust.customerUnit} Units</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-green-600">Rs. {Number(cust.totalPrice).toLocaleString('en-PK')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-400">No customers have purchased units for this item yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeModal === 'planDetails' ? (
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">CNIC</th>
                        <th className="py-2 px-3">Inventory ID</th>
                        <th className="py-2 px-3">Units Assigned</th>
                        <th className="py-2 px-3">Total Investment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                      {sortLatestFirst(
                        dashboardData.stats.inventory.list
                          .flatMap((item: any) => item.customerDetails || [])
                          .filter((p: any) => p.plan === selectedPlanFilter && p.status === 'Active')
                      ).map((cust: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(cust)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{cust.cnic}</td>
                          <td className="py-2.5 px-3 text-gray-500">{cust.inventoryId}</td>
                          <td className="py-2.5 px-3 font-bold text-primary">{cust.customerUnit} Units</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-green-600">Rs. {Number(cust.totalPrice).toLocaleString('en-PK')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <div className="px-6 py-3 bg-gray-100 dark:bg-darkmode border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">Search Rows:</span>
                    <input 
                      type="text"
                      placeholder="Type keyword to filter rows..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setModalPage(1); }}
                      className="flex-1 bg-white dark:bg-semidark border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-black dark:text-white outline-none"
                    />
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                    {activeModal === 'inventory' && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Title / Location</th>
                            <th className="py-2 px-3">Total Units (1Lakh)</th>
                            <th className="py-2 px-3">Sold Units</th>
                            <th className="py-2 px-3">Available Units</th>
                            <th className="py-2 px-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                          {paginatedRows.map((i: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedInventoryItem(i)}>
                              <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(i)}</td>
                              <td className="py-2.5 px-3 font-bold">{i.property_title} <br/><span className="text-[10px] text-gray-400">{i.location}</span></td>
                              <td className="py-2.5 px-3 font-bold text-primary">{i.totalUnits} Units</td>
                              <td className="py-2.5 px-3 font-bold text-red-500">{i.soldUnits} Units</td>
                              <td className="py-2.5 px-3 font-bold text-green-600">{i.availableUnits} Units</td>
                              <td className="py-2.5 px-3">
                                <button className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold">
                                  View Customers &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeModal === 'properties' && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Title</th>
                            <th className="py-2 px-3">City / Area</th>
                            <th className="py-2 px-3">Price</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                          {paginatedRows.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(p)}</td>
                              <td className="py-2.5 px-3 font-bold">{p.property_title}</td>
                              <td className="py-2.5 px-3 text-gray-500">{p.city}, {p.area}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-primary">Rs. {Number(p.price).toLocaleString('en-PK')}</td>
                              <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">{p.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeModal === 'transactions' && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Tx Number</th>
                            <th className="py-2 px-3">CNIC</th>
                            <th className="py-2 px-3">Plan</th>
                            <th className="py-2 px-3">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                          {paginatedRows.map((t: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(t)}</td>
                              <td className="py-2.5 px-3 font-bold">{t.transactionNumber}</td>
                              <td className="py-2.5 px-3 font-mono">{t.cnic}</td>
                              <td className="py-2.5 px-3 text-gray-500">{t.plan}</td>
                              <td className="py-2.5 px-3 font-bold text-green-600">Rs. {Number(t.calculatedAmount).toLocaleString('en-PK')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeModal === 'cashFlow' && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">CNIC / Name</th>
                            <th className="py-2 px-3">Source / Dest</th>
                            <th className="py-2 px-3">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                          {paginatedRows.map((l: any, idx: number) => {
                            const isCashIn = (l.transactionType || "").toLowerCase().includes('cash in');
                            return (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDate(l)}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isCashIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {l.transactionType}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold">{l.customerName} <br/><span className="text-[10px] text-gray-400 font-mono">{l.cnic}</span></td>
                                <td className="py-2.5 px-3">
                                  {isCashIn ? (
                                    <div>
                                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Received From:</span>
                                      <span className="font-bold text-gray-700 dark:text-gray-300">{l.receivedFrom || 'N/A'}</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-[10px] text-gray-400 uppercase block font-semibold">Given To:</span>
                                      <span className="font-bold text-gray-700 dark:text-gray-300">{l.givenTo || 'N/A'}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-primary">Rs. {Number(l.amount).toLocaleString('en-PK')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}

                    {activeModal === 'activityLogs' && (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase">
                            <th className="py-2 px-3">Date / Time</th>
                            <th className="py-2 px-3">Action</th>
                            <th className="py-2 px-3">User / CNIC</th>
                            <th className="py-2 px-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                          {paginatedRows.map((l: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2.5 px-3 text-gray-500 font-medium">{formatDateTime(l)}</td>
                              <td className="py-2.5 px-3 font-bold text-primary">{l.action}</td>
                              <td className="py-2.5 px-3 font-mono">{l.cnic || l.userName || 'System'}</td>
                              <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">{l.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-50 dark:bg-darkmode border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">Page {modalPage} of {totalPages}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalPage((prev) => Math.max(prev - 1, 1))}
                          disabled={modalPage === 1}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg font-bold disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setModalPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={modalPage === totalPages}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg font-bold disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-darkmode flex justify-end">
                <button 
                  onClick={() => { setActiveModal(null); setSearchQuery(""); setModalPage(1); setSelectedInventoryItem(null); setSelectedPlanFilter(null); }}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-80 transition"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}