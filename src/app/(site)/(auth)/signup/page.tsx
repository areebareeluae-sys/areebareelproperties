"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "../../../components/shared/Loader";

const CustomerSignup = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setIsMounted(true);
  }, []);

  // Name Validation (Sirf alphabets, min 3, max 50 characters, no numbers)
  const validateName = (name: string) => {
    if (!name.trim()) return "Full name is required.";
    if (!/^[a-zA-Z\s]{3,50}$/.test(name)) {
      return "Name must be 3-50 characters long and contain only letters.";
    }
    return "";
  };

  // CNIC Validation (Strict 13 digits format: 33303-3332783-9)
  const validateCnic = (cnic: string) => {
    if (!cnic.trim()) return "CNIC number is required.";
    const cleanCnic = cnic.replace(/-/g, "");
    if (cleanCnic.length !== 13 || !/^\d+$/.test(cleanCnic)) {
      return "Please enter a valid 13-digit CNIC number.";
    }
    return "";
  };

  // Phone Validation (Strict Pakistani format: 03XXXXXXXXX - exact 11 digits)
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required.";
    if (!/^03\d{9}$/.test(phone)) {
      return "Phone must be 11 digits and start with 03 (e.g., 03049899037).";
    }
    return "";
  };

  // Password Validation (Min 6, Max 30 characters)
  const validatePassword = (password: string) => {
    if (!password) return "Password is required.";
    if (password.length < 6 || password.length > 30) {
      return "Password must be between 6 and 30 characters.";
    }
    return "";
  };

  // CNIC Formatting & Limit (Max 15 chars with dashes)
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

  // Phone Formatting & Limit (Strictly numbers, max 11 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Sirf numbers allow karein
    if (value.length > 11) value = value.slice(0, 11); // 11 digits se zyada rok dein

    setFormData((prev) => ({ ...prev, phone: value }));
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  // Name Change Handler with max length check
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 50) value = value.slice(0, 50); // Max 50 characters

    setFormData((prev) => ({ ...prev, name: value }));
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  // Password Change Handler with max length check
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 30) value = value.slice(0, 30); // Max 30 characters

    setFormData((prev) => ({ ...prev, password: value }));
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
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
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed.");
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="pt-32 pb-20 bg-light dark:bg-darkmode min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-semidark px-8 py-10 rounded-xl shadow-xl text-left">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-1">
            Create Customer Account
          </h2>
          <p className="text-xs text-gray-500">Register with your CNIC and details to get started.</p>
        </div>

        <Toaster />

        <form onSubmit={handleSubmit}>
          {/* Full Name (Max 50 chars, no numbers) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">Full Name</label>
            <input
              required
              type="text"
              name="name"
              maxLength={50}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* CNIC Number (Strict 13 digits, formatted) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">CNIC Number</label>
            <input
              required
              type="text"
              name="cnic"
              maxLength={15}
              placeholder="33303-3332783-9"
              value={formData.cnic}
              onChange={handleCnicChange}
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base font-mono text-dark dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Format: 33303-3332783-9 (Strictly 13 digits)</span>
            {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
          </div>

          {/* Phone Number (Strict 11 digits, starts with 03) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">Phone Number</label>
            <input
              required
              type="text"
              name="phone"
              maxLength={11}
              placeholder="03049899037"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base font-mono text-dark dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Format: 03XXXXXXXXX (Exact 11 digits)</span>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}qq</p>}
          </div>

          {/* Password (Min 6, Max 30 chars) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">Password</label>
            <input
              required
              type="password"
              name="password"
              maxLength={30}
              placeholder="••••••••"
              value={formData.password}
              onChange={handlePasswordChange}
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none focus:border-black dark:focus:border-white"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Must be between 6 and 30 characters</span>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black hover:opacity-90 px-5 py-3 text-base transition duration-300 ease-in-out font-medium shadow-md disabled:opacity-50"
            >
              Sign Up {loading && <Loader />}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CustomerSignup;