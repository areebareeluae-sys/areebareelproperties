"use client";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Logo from "../../layout/header/logo";
import Loader from "../../shared/Loader";

const Signin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let errors = { email: "", password: "" };
    let isValid = true;

    if (!loginData.email) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
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

      localStorage.setItem("user", JSON.stringify({ user: data.data.name, email: data.data.email }));
      document.cookie = "user=true; path=/; max-age=86400"; 

      toast.success('Login successful!');
      router.push("/");
    } catch (error) {
      console.error('Signin error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="name@example.com"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className="w-full rounded-md border placeholder:text-gray-400 border-border dark:border-dark_border border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition focus:border-black dark:text-white dark:focus:border-white"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Password
            </label>
            <input
              required
              type="password"
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