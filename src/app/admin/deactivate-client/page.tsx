"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function ManageStatusPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cnicFilter, setCnicFilter] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchAssignments = async (cnic: string) => {
    if (!cnic.trim()) {
      toast.error("Please enter a CNIC to search");
      return;
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const res = await fetch(`/api/inventory-status?cnic=${encodeURIComponent(cnic)}`);
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        toast.error(data.message || "Failed to load data");
      }
    } catch (error) {
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  // CNIC Auto-formatting logic (33303-3332783-9)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);

    let formattedValue = value;
    if (value.length > 5 && value.length <= 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }

    setCnicFilter(formattedValue);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssignments(cnicFilter);
  };

  const toggleStatus = async (assignmentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    try {
      const res = await fetch('/api/inventory-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully changed status to ${newStatus}`);
        fetchAssignments(cnicFilter);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  return (
   <div className="bg-transparent py-8 px-4 mt-[100px] sm:px-6 lg:px-8 text-black dark:text-white">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Reference Style Centered Search Card */}
        <div className="bg-white dark:bg-semidark p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-dark_border space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Inventory Status Management</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Search client by CNIC to view active inventory profit plans, records, and manage active/deactivated statuses.</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full">
              <input 
                type="text" 
                placeholder="33303-3332783-9" 
                value={cnicFilter}
                onChange={handleCnicChange}
                maxLength={15}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-dark_border bg-gray-50/50 dark:bg-darkmode font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Search Client
              </button>
              {hasSearched && (
                <button 
                  type="button" 
                  onClick={() => { setCnicFilter(""); setAssignments([]); setHasSearched(false); }}
                  className="px-4 py-3 bg-gray-100 dark:bg-darkmode text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs border border-gray-200 dark:border-dark_border hover:bg-gray-200 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section (Appears only after search) */}
        {hasSearched && (
          <div className="bg-white dark:bg-semidark shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-dark_border animate-fadeIn">
            <div className="p-5 border-b border-gray-200 dark:border-dark_border flex justify-between items-center bg-gray-50/50 dark:bg-darkmode/50">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Client Inventory Profit Records</h3>
              <span className="text-[11px] font-bold text-gray-400">Total Found: {assignments.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-dark_border text-left text-[11px]">
                <thead className="bg-gray-50 dark:bg-darkmode text-gray-400 font-extrabold uppercase whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3">Property / Inv Name</th>
                    <th className="px-4 py-3">CNIC</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">Inv Price</th>
                    <th className="px-4 py-3">Total Price</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Profit Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark_border font-bold whitespace-nowrap">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400 text-xs">Searching records...</td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400 text-xs font-medium">No inventory profit records found for this CNIC.</td>
                    </tr>
                  ) : (
                    assignments.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-darkmode transition-colors">
                        <td className="px-4 py-3.5 text-black dark:text-white">{item.inventoryName || 'N/A'}</td>
                        <td className="px-4 py-3.5 font-mono text-gray-600 dark:text-gray-300">{item.cnic}</td>
                        <td className="px-4 py-3.5 text-black dark:text-white">{item.customerUnit}</td>
                        <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">Rs. {Number(item.inventoryPrice || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-black dark:text-white">Rs. {Number(item.totalPrice || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-darkmode text-black dark:text-white rounded-lg text-[10px] border border-gray-200 dark:border-dark_border">
                            {item.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 font-normal">{item.date ? item.date.split('T')[0] : 'N/A'}</td>
                        <td className="px-4 py-3.5 text-gray-500 font-normal">{item.profitDate ? item.profitDate.split('T')[0] : 'N/A'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-1 rounded-md text-[10px] ${
                            item.status === 'Deactivated' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {item.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button 
                            onClick={() => toggleStatus(item.id, item.status || 'Active')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-sm transition-all ${
                              item.status === 'Deactivated'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {item.status === 'Deactivated' ? 'Activate' : 'Deactivate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}