"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function InternalCashReportPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Helper function to get local date in YYYY-MM-DD format
  const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Fetch all cash logs on load
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cash-received");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || data.applications || []);
      } else {
        toast.error("Failed to load cash logs");
      }
    } catch (error) {
      toast.error("Error fetching report data");
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on selected date range accurately using local timezone
  const filteredLogs = logs.filter((log) => {
    if (!log.createdAt) return false;
    const logDate = getLocalDateString(new Date(log.createdAt));
    
    if (startDate && endDate) {
      return logDate >= startDate && logDate <= endDate;
    } else if (startDate) {
      return logDate >= startDate;
    } else if (endDate) {
      return logDate <= endDate;
    }
    return true;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, logs]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredLogs.slice(indexOfFirstRow, indexOfLastRow);

  // Calculations for Summary based on filtered data
  const totalCashIn = filteredLogs
    .filter((log) => log.transactionType === "Cash In")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalCashOut = filteredLogs
    .filter((log) => log.transactionType !== "Cash In")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Clean Modern Professional Print Styling */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: #111 !important;
            font-family: 'Inter', Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .professional-print-report {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-transparent pt-32 pb-12 px-4 sm:px-6 lg:px-8 text-black dark:text-white">
        <Toaster position="top-right" />
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* ================= PROFESSIONAL PRINT REPORT FORMAT ================= */}
          <div className="hidden professional-print-report space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3">
              <div>
                <h1 className="text-lg font-black uppercase tracking-wide text-gray-900">Internal Cash Movement Report</h1>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Official Corporate Financial Statement</p>
              </div>
              <div className="text-right text-[10px] font-bold text-gray-700 space-y-0.5">
                <p>Period: {startDate} To {endDate}</p>
                <p>Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Summary Boxes for Print */}
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="border border-gray-300 p-2.5 rounded bg-gray-50">
                <p className="text-[9px] uppercase font-bold text-gray-500">Total Cash In (Received)</p>
                <p className="text-sm font-black text-green-700 mt-0.5">Rs. {totalCashIn.toLocaleString()}</p>
              </div>
              <div className="border border-gray-300 p-2.5 rounded bg-gray-50">
                <p className="text-[9px] uppercase font-bold text-gray-500">Total Cash Out / Send</p>
                <p className="text-sm font-black text-red-700 mt-0.5">Rs. {totalCashOut.toLocaleString()}</p>
              </div>
            </div>

            {/* Clean Professional Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 text-[10px] uppercase font-bold text-gray-800">
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Customer / CNIC</th>
                  <th className="py-2 px-2">Source (From)</th>
                  <th className="py-2 px-2">Destination (To)</th>
                  <th className="py-2 px-2">Agent</th>
                  <th className="py-2 px-2">Date & Time</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[10px]">
                {currentRows.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2 px-2 font-bold">
                      <span className={log.transactionType === "Cash In" ? "text-green-700" : "text-red-700"}>
                        {log.transactionType}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-bold">{log.customerName || "N/A"}</div>
                      <div className="text-[9px] text-gray-500">{log.cnic}</div>
                    </td>
                    <td className="py-2 px-2 text-gray-700">{log.receivedFrom}</td>
                    <td className="py-2 px-2 text-gray-700">{log.givenTo}</td>
                    <td className="py-2 px-2 text-gray-700">{log.agentName}</td>
                    <td className="py-2 px-2 text-[9px] text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-black text-gray-900">Rs. {Number(log.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signatures for Print */}
            <div className="flex justify-between pt-16 text-[10px] font-bold text-gray-800">
              <div className="text-center">
                <p>___________________________</p>
                <p className="mt-1 uppercase">Prepared By</p>
              </div>
              <div className="text-center">
                <p>___________________________</p>
                <p className="mt-1 uppercase">Verified By</p>
              </div>
              <div className="text-center">
                <p>___________________________</p>
                <p className="mt-1 uppercase">Manager Signature</p>
              </div>
            </div>
          </div>
          {/* ================= END OF PRINT FORMAT ================= */}


          {/* Screen Header (Hidden when printing) */}
          <div className="no-print bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-black">Internal Cash Movement Report</h1>
              <p className="text-xs text-gray-500 mt-1">Complete overview of cash inflow, outflow, sources, and destinations.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrintPDF}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center gap-2"
              >
                <span>🖨️</span> Print / Save Report
              </button>
              <button 
                onClick={fetchLogs}
                className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs shadow"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Date Filter Box (Hidden when printing) */}
          <div className="no-print bg-white dark:bg-semidark p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-extrabold mb-1 text-gray-400">Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent font-bold outline-none w-full"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-extrabold mb-1 text-gray-400">End Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent font-bold outline-none w-full"
                />
              </div>
            </div>
            <button 
              onClick={() => {
                setStartDate(todayStr);
                setEndDate(todayStr);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-darkmode text-xs font-bold rounded-xl border border-gray-200 dark:border-dark_border hover:opacity-80 transition-opacity"
            >
              Reset to Today
            </button>
          </div>

          {/* Summary Cards (Screen view) */}
          <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border border-l-4 border-l-green-500">
              <p className="text-xs uppercase font-extrabold text-gray-500">Total Cash In (Received)</p>
              <h3 className="text-3xl font-black mt-2 text-green-600">Rs. {totalCashIn.toLocaleString()}</h3>
            </div>
            <div className="bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border border-l-4 border-l-red-500">
              <p className="text-xs uppercase font-extrabold text-gray-500">Total Cash Out / Send</p>
              <h3 className="text-3xl font-black mt-2 text-red-600">Rs. {totalCashOut.toLocaleString()}</h3>
            </div>
          </div>

          {/* Transactions Table (Screen view) */}
          <div className="no-print bg-white dark:bg-semidark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase">Transaction Logs (Click row for full info)</h3>
              <span className="text-xs text-gray-400 font-bold">Showing {filteredLogs.length > 0 ? indexOfFirstRow + 1 : 0}-{Math.min(indexOfLastRow, filteredLogs.length)} of {filteredLogs.length}</span>
            </div>
            
            {loading ? (
              <p className="text-xs text-center py-6 text-gray-500">Loading report data...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-xs text-center py-6 text-gray-500">No cash logs found for selected date range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark_border text-[11px] uppercase font-extrabold text-gray-400">
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Customer / CNIC</th>
                      <th className="py-3 px-2">Amount (Rs.)</th>
                      <th className="py-3 px-2">From (Source)</th>
                      <th className="py-3 px-2">To (Destination)</th>
                      <th className="py-3 px-2">Agent</th>
                      <th className="py-3 px-2">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark_border text-xs font-bold">
                    {currentRows.map((log) => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-gray-50 dark:hover:bg-darkmode cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] ${log.transactionType === "Cash In" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {log.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div>{log.customerName || "N/A"}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{log.cnic}</div>
                        </td>
                        <td className="py-3 px-2">Rs. {Number(log.amount).toLocaleString()}</td>
                        <td className="py-3 px-2">{log.receivedFrom}</td>
                        <td className="py-3 px-2">{log.givenTo}</td>
                        <td className="py-3 px-2">{log.agentName}</td>
                        <td className="py-3 px-2 text-[10px] text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-dark_border">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-darkmode text-xs font-bold rounded-xl border border-gray-200 dark:border-dark_border disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-darkmode text-xs font-bold rounded-xl border border-gray-200 dark:border-dark_border disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Detailed Modal Popup */}
          {selectedLog && (
            <div className="no-print fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-semidark w-full max-w-lg p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-dark_border space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-dark_border pb-3">
                  <h3 className="text-sm font-black uppercase text-primary">Transaction Complete Details</h3>
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-darkmode p-3 rounded-xl">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Type</span>
                      <span className="font-black text-sm">{selectedLog.transactionType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Amount</span>
                      <span className="font-black text-sm text-primary">Rs. {Number(selectedLog.amount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Name & CNIC</span>
                    <p className="font-bold">{selectedLog.customerName} ({selectedLog.cnic})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Cash Received From (Source)</span>
                      <p className="font-bold text-green-600">{selectedLog.receivedFrom}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Cash Given To (Destination)</span>
                      <p className="font-bold text-red-600">{selectedLog.givenTo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Slip / Reference Number</span>
                      <p className="font-bold">{selectedLog.slipOrRefNumber || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Handled By Agent</span>
                      <p className="font-bold">{selectedLog.agentName}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Internal Remarks</span>
                    <p className="p-2 bg-gray-50 dark:bg-darkmode rounded-lg mt-1">{selectedLog.internalRemarks || "No remarks provided."}</p>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Date & Time</span>
                    <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}