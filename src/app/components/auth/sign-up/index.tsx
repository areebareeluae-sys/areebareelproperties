"use client";
import { useState, useEffect } from "react";
import Loader from "../../shared/Loader";

interface User {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  status?: string;
  createdAt?: string;
}

const UserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pagination state (10 items limit)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    cnic: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/signup');
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received from /api/signup");
        setFetching(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setFetching(false);
    }
  };

  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required.";
    if (!/^[a-zA-Z\s]{3,}$/.test(name)) return "Name must be at least 3 characters long and contain only letters.";
    return "";
  };

  const validateCnic = (cnic: string) => {
    if (!cnic.trim()) return "CNIC number is required.";
    const cleanCnic = cnic.replace(/-/g, "");
    if (cleanCnic.length !== 13 || !/^\d+$/.test(cleanCnic)) {
      return "CNIC Not Eligible: Please enter a valid 13-digit CNIC number.";
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required.";
    if (!/^[\d\+\-\s]{10,}$/.test(phone)) return "Please enter a valid phone number.";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!editingUser && !password.trim()) return "Password is required.";
    if (password && password.length < 6) return "Password must be at least 6 characters long.";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({
      ...prev,
      [name]:
        name === "name"
          ? validateName(value)
          : name === "phone"
          ? validatePhone(value)
          : name === "password"
          ? validatePassword(value)
          : "",
    }));
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 13) value = value.slice(0, 13);

    let formattedValue = value;
    if (value.length > 5 && value.length <= 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }

    setFormData((prev) => ({ ...prev, cnic: formattedValue }));
    setErrors((prev) => ({ ...prev, cnic: validateCnic(formattedValue) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const cnicError = validateCnic(formData.cnic);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({ name: nameError, cnic: cnicError, phone: phoneError, password: passwordError });
    if (nameError || cnicError || phoneError || passwordError) return;

    setLoading(true);
    try {
      const endpoint = editingUser ? `/api/signup/${editingUser.id}` : '/api/signup';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        alert("Server returned a non-JSON response. Please check your API route path.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Operation failed.');
        return;
      }

      alert(editingUser ? 'User updated successfully.' : 'Account created successfully.');
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: "", cnic: "", phone: "", password: "" });
      fetchUsers();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Something went wrong, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, cnic: user.cnic, phone: user.phone, password: "" });
    setErrors({ name: "", cnic: "", phone: "", password: "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`/api/signup/${id}`, {
          method: 'DELETE',
        });
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          alert("Server error or delete API endpoint missing.");
          return;
        }
        const data = await res.json();
        if (res.ok) {
          alert("User deleted successfully.");
          fetchUsers();
        } else {
          alert(data.message || "Failed to delete user.");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Something went wrong.");
      }
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="pt-32 pb-20 px-4 sm:px-8 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-transparent p-6 gap-4">
          <div className="w-full sm:w-auto"></div>
          <h2 className="text-3xl font-extrabold text-black dark:text-white text-center flex-1">
            User Management
          </h2>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", cnic: "", phone: "", password: "" });
              setErrors({ name: "", cnic: "", phone: "", password: "" });
              setIsModalOpen(true);
            }}
            className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-md font-medium shadow hover:opacity-90 transition"
          >
            + Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-semidark rounded-xl shadow-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">CNIC Number</th>
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Created At</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">Loading users...</td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                      <td className="p-4 text-black dark:text-white">{user.name}</td>
                      <td className="p-4 text-black dark:text-white">{user.cnic}</td>
                      <td className="p-4 text-black dark:text-white">{user.phone}</td>
                      <td className="p-4 text-black dark:text-white text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Numbers */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-10">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  currentPage === number
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-semidark text-black dark:text-white hover:opacity-80 shadow"
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        )}

        {/* Modal Popup for Add / Edit User */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-semidark max-w-md w-full p-8 rounded-xl shadow-2xl relative">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
                {editingUser ? "Edit User & Password" : "Add New User"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-dark_border bg-transparent px-4 py-3 text-base text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    CNIC Number {editingUser ? "(Disabled)" : ""}
                  </label>
                  <input
                    type="text"
                    placeholder="33303-3332783-9"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleCnicChange}
                    disabled={!!editingUser}
                    maxLength={15}
                    className={`w-full rounded-md border border-gray-300 dark:border-dark_border px-4 py-3 text-base text-black dark:text-white outline-none ${
                      editingUser 
                        ? "bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed" 
                        : "bg-transparent focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Phone Number {editingUser ? "(Disabled)" : ""}
                  </label>
                  <input
                    type="text"
                    placeholder="+923001234567"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!!editingUser}
                    className={`w-full rounded-md border border-gray-300 dark:border-dark_border px-4 py-3 text-base text-black dark:text-white outline-none ${
                      editingUser 
                        ? "bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed" 
                        : "bg-transparent focus:border-black dark:focus:border-white"
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    {editingUser ? "New Password (Leave blank to keep current)" : "Password"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full rounded-md border border-gray-300 dark:border-dark_border bg-transparent px-4 py-3 text-base text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-medium hover:opacity-80 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    {editingUser ? "Update User" : "Save User"} {loading && <Loader />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagement;