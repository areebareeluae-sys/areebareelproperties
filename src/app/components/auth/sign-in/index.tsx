"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Link from "next/link"; // Link component import kiya gaya hai
import Logo from "../../layout/header/logo";
import Loader from "../../shared/Loader";

const Signin = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    identifier: "",
    password: "",
  });

  // Check if current input looks like a numeric CNIC vs Email
  const isNumericInput = /^[0-9\-]+$/.test(loginData.identifier) || /^\d/.test(loginData.identifier);

  // Hydration mismatch rokne ke liye mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const isNumeric = /^[0-9\-]+$/.test(value) || /^\d/.test(value);

    if (isNumeric) {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 13) digits = digits.slice(0, 13);

      let formattedCnic = digits;
      if (digits.length > 5 && digits.length <= 12) {
        formattedCnic = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      } else if (digits.length > 12) {
        formattedCnic = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
      }
      setLoginData({ ...loginData, identifier: formattedCnic });
    } else {
      // Agar email hai toh bina kisi restriction ke save karein
      setLoginData({ ...loginData, identifier: value });
    }
  };

  const validateForm = () => {
    let errors = { identifier: "", password: "" };
    let isValid = true;

    const inputVal = loginData.identifier.trim();
    if (!inputVal) {
      errors.identifier = "Email or CNIC is required.";
      isValid = false;
    } else {
      const isCnic = /^\d{5}-\d{7}-\d{1}$/.test(inputVal);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputVal);

      if (!isCnic && !isEmail) {
        errors.identifier = "Please enter a valid CNIC (33330-3333327-8) or Email (must contain @).";
        isValid = false;
      }
    }

    if (!loginData.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (loginData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Login fail ho gaya');
        return;
      }

      const userInfo = data.data || data.user || data;

      if (data.role === 'office') {
        localStorage.setItem("user", JSON.stringify({ 
          id: userInfo?.id,
          name: userInfo?.name, 
          email: userInfo?.email, 
          cnic: userInfo?.cnic,
          departmentId: userInfo?.departmentId,
          userRole: userInfo?.userRole,
          role: 'office'
        }));
        
        document.cookie = `admin_token=office_logged_in; path=/; max-age=86400`;

        toast.success('Office Login successful!');
        router.push("/admin/dashboard");
      } else {
        localStorage.setItem("user", JSON.stringify({ 
          id: userInfo?.id,
          name: userInfo?.name, 
          email: userInfo?.email,
          cnic: userInfo?.cnic,
          role: 'client'
        }));

        document.cookie = `user_token=client_logged_in; path=/; max-age=86400`;

        toast.success('Login successful!');
        router.push("/");
      }

    } catch (error) {
      console.error('Signin error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="pt-40 pb-32 bg-light dark:bg-darkmode min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-semidark px-8 py-12 sm:px-10 rounded-xl shadow-xl text-left">
        <div className="flex flex-col items-center mb-8">
          <div className="max-w-[140px] w-full mb-3 flex justify-center">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            SignIn Chiron
          </h2>
        </div>

        <Toaster />

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Enter CNIC or Mobile Number
            </label>
            <input
              required
              type="text"
              placeholder="33330-3333327-8 or 03049899037"
              value={loginData.identifier}
              onChange={handleIdentifierChange}
              maxLength={isNumericInput ? 15 : undefined}
              className="w-full rounded-md border placeholder:text-gray-400 border-border dark:border-dark_border border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition focus:border-black dark:text-white dark:focus:border-white"
            />
            {validationErrors.identifier && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.identifier}</p>
            )}
          </div>

          <div className="mb-4">
  <label className="block text-sm font-medium text-dark dark:text-white mb-2">
    Password
  </label>
  <input
    required
    type="password"
    maxLength={25}
    placeholder="••••••••"
    value={loginData.password}
    onChange={(e) =>
      setLoginData({ ...loginData, password: e.target.value })
    }
    className="w-full rounded-md border border-border dark:border-dark_border border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition focus:border-black dark:text-white dark:focus:border-white"
  />
  {validationErrors.password && (
    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
  )}
</div>

          {/* Professional Forget Password Link */}
          <div className="flex items-center justify-end mb-6">
            <Link
              href="/forget-password"
              className="text-sm font-medium text-primary hover:underline dark:text-gray-300"
            >
              Forgot Password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black hover:opacity-90 px-5 py-3 text-base transition duration-300 ease-in-out font-medium shadow-md"
            >
              Login Chiron {loading && <Loader />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;