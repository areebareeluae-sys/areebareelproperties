"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function OfficeUsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States for Create
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    role: "staff",
  });

  // Form States for Edit
  const [editForm, setEditForm] = useState({
    departmentId: "",
    password: "",
  });

  // Fetch Users and Departments
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/office-users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setDepartmentList(data.departments || []);
      }
    } catch (error) {
      toast.error("Failed to fetch office data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("/api/office-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          actorId: loggedInUser.id || "admin_system",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User created successfully!");
      setIsCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", departmentId: "", role: "staff" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error creating user");
    }
  };

  // Open Edit Modal
  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      departmentId: user.departmentId || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload: any = {
        id: selectedUser.id,
        departmentId: editForm.departmentId,
        actorId: loggedInUser.id || "admin_system",
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }

      const res = await fetch("/api/office-users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User updated successfully!");
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error updating user");
    }
  };

  // Toggle Status
  const toggleStatus = async (user: any) => {
    const nextStatus = user.isActive === false ? true : false;
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("/api/office-users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: user.id, 
          isActive: nextStatus,
          actorId: loggedInUser.id || "admin_system"
        }),
      });
      if (!res.ok) throw new Error("Failed to change status");

      toast.success(`User status updated to ${nextStatus ? 'Active' : 'Deactive'}`);
      fetchData();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  // Helper to get department name by ID
  const getDepartmentName = (deptId: string) => {
    const dept = departmentList.find((d) => d.id === deptId);
    return dept ? dept.name : "N/A";
  };

  // Filtered Users based on Search Query (Name or Email)
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Centered Heading without borders/containers */}
        <div className="text-center py-4">
          <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
            Office Users Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage staff, departments, active status and credentials
          </p>
        </div>

        {/* Search & Create Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-semidark p-6 rounded-2xl shadow-md">
          <div className="w-full md:w-auto flex-1">
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 text-xs rounded-xl bg-gray-100 dark:bg-darkmode text-black dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:opacity-95 transition whitespace-nowrap"
          >
            + Create New User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-semidark shadow-lg rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center font-medium">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {users.length === 0 ? "No office users found." : "No users match your search query."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 dark:bg-darkmode text-black dark:text-white font-extrabold uppercase">
                    <tr>
                      <th className="px-6 py-4">Name & Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-darkmode font-medium">
                    {currentRows.map((u) => {
                      const isActive = u.isActive !== false;
                      return (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-darkmode/50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-black dark:text-white">{u.name}</div>
                            <div className="text-gray-500 text-[11px]">{u.email}</div>
                          </td>
                          <td className="px-6 py-4 uppercase font-bold">{u.role}</td>
                          <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-bold">
                            {getDepartmentName(u.departmentId)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {isActive ? 'Active' : 'Deactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button 
                              onClick={() => openEditModal(u)}
                              className="bg-gray-200 text-black px-3 py-1.5 rounded font-bold hover:bg-gray-300"
                            >
                              Edit Dept/Pass
                            </button>
                            <button 
                              onClick={() => toggleStatus(u)}
                              className={`px-3 py-1.5 rounded font-bold text-white ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {isActive ? 'Deactive' : 'Active'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 dark:bg-darkmode gap-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Showing <span className="font-bold text-black dark:text-white">{indexOfFirstRow + 1}</span> to <span className="font-bold text-black dark:text-white">{Math.min(indexOfLastRow, filteredUsers.length)}</span> of <span className="font-bold text-black dark:text-white">{filteredUsers.length}</span> entries
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-white dark:bg-semidark text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
                  >
                    Previous
                  </button>

                  <div className="text-xs font-bold text-black dark:text-white px-2">
                    Page {currentPage} of {totalPages || 1}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-white dark:bg-semidark text-black dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-semidark text-black dark:text-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg text-black dark:text-white font-black">Create Office User</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Full Name</label>
                <input 
                  type="text" required 
                  value={createForm.name} 
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white focus:outline-none border border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Email</label>
                <input 
                  type="email" required 
                  value={createForm.email} 
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white focus:outline-none border border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Password</label>
                <input 
                  type="password" required 
                  value={createForm.password} 
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white focus:outline-none border border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Department</label>
                <select 
                  value={createForm.departmentId} 
                  onChange={(e) => setCreateForm({...createForm, departmentId: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none border border-gray-300 dark:border-gray-700"
                >
                  <option value="">Select Department</option>
                  {departmentList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} (Step {dept.stepOrder})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Role</label>
                <select 
                  value={createForm.role} 
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none border border-gray-300 dark:border-gray-700"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 bg-gray-200 text-black rounded text-xs font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-semidark text-black dark:text-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-black">Edit User: {selectedUser.name}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="bg-gray-100 dark:bg-darkmode p-3 rounded text-[11px] text-gray-500">
                Note: Name and Email cannot be modified here. You can only change the Department or set a new password.
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">Department</label>
                <select 
                  value={editForm.departmentId} 
                  onChange={(e) => setEditForm({...editForm, departmentId: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white font-bold focus:outline-none border border-gray-300 dark:border-gray-700"
                >
                  <option value="">Select Department</option>
                  {departmentList.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} (Step {dept.stepOrder})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-extrabold mb-1">New Password (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  placeholder="Enter new password if you want to change" 
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full px-3 py-2 text-xs rounded bg-gray-100 dark:bg-darkmode text-black dark:text-white focus:outline-none border border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-gray-200 text-black rounded text-xs font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}