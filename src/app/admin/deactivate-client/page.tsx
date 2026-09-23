"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function ManageStatusPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cnicFilter, setCnicFilter] = useState("");

  const fetchAssignments = async (cnic = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory-status${cnic ? `?cnic=${cnic}` : ''}`);
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

  useEffect(() => {
    fetchAssignments();
  }, []);

  // CNIC Auto-formatting logic
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
    <div className="min-h-screen bg-transparent pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-[95%] mx-auto space-y-6">
        
        {/* Header - Centered & Clean Background */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl">
          <h1 className="text-3xl font-extrabold text-black dark:text-white text-center">Inventory Profit Records & Status Management</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Filter by CNIC to view all inventory profit fields and manage active/deactivated statuses.</p>
        </div>

        {/* Filter Box with Auto-formatted CNIC */}
        <div className="bg-white dark:bg-semidark p-6 rounded-2xl ">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs uppercase font-extrabold mb-2 text-black dark:text-white">Filter by CNIC</label>
              <input 
                type="text" 
                placeholder="33303-3332783-9" 
                value={cnicFilter}
                onChange={handleCnicChange}
                maxLength={15}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 dark:border-dark_border bg-transparent text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="submit" 
                className="flex-1 sm:flex-none px-6 py-3 bg-black hover:opacity-90 dark:bg-white dark:text-black text-white rounded-xl font-bold text-xs shadow transition"
              >
                Search
              </button>
              <button 
                type="button" 
                onClick={() => { setCnicFilter(""); fetchAssignments(""); }}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl font-bold text-xs hover:opacity-80 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark_border font-black text-sm uppercase bg-gray-50 dark:bg-darkmode text-black dark:text-white">
            Inventory Profit Data Table
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-dark_border text-left text-[11px]">
              <thead className="bg-gray-50 dark:bg-darkmode text-black dark:text-white font-extrabold uppercase whitespace-nowrap">
                <tr>
                  <th className="px-3 py-3">Property / Inv Name</th>
                  <th className="px-3 py-3">CNIC</th>
                  <th className="px-3 py-3">Units</th>
                  <th className="px-3 py-3">Inv Price</th>
                  <th className="px-3 py-3">Total Price</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Payment Method</th>
                  <th className="px-3 py-3">Account No</th>
                  <th className="px-3 py-3">Holder Name</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Profit Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark_border font-medium whitespace-nowrap">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="text-center py-6 font-bold text-gray-500">Loading records...</td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-6 font-bold text-gray-500">No records found.</td>
                  </tr>
                ) : (
                  assignments.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                      <td className="px-3 py-3 font-bold text-black dark:text-white">{item.inventoryName || item.inventoryId}</td>
                      <td className="px-3 py-3 font-mono font-bold text-black dark:text-white">{item.cnic}</td>
                      <td className="px-3 py-3 font-extrabold text-black dark:text-white">{item.customerUnit}</td>
                      <td className="px-3 py-3 text-black dark:text-white">Rs. {Number(item.inventoryPrice || 0).toLocaleString()}</td>
                      <td className="px-3 py-3 font-bold text-black dark:text-white">Rs. {Number(item.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded font-bold text-[10px]">
                          {item.plan}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-blue-600 dark:text-blue-400 font-bold uppercase">{item.paymentMethod || 'N/A'}</td>
                      <td className="px-3 py-3 font-mono text-gray-600 dark:text-gray-300">{item.accountNumber || 'N/A'}</td>
                      <td className="px-3 py-3 text-black dark:text-white">{item.accountHolderName || 'N/A'}</td>
                      <td className="px-3 py-3 text-gray-500">{item.date ? item.date.split('T')[0] : 'N/A'}</td>
                      <td className="px-3 py-3 text-gray-500">{item.profitDate ? item.profitDate.split('T')[0] : 'N/A'}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === 'Deactivated' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button 
                          onClick={() => toggleStatus(item.id, item.status || 'Active')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] shadow transition ${
                            item.status === 'Deactivated'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
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

      </div>
    </div>
  );
}