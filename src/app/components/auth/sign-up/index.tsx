"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../shared/Loader";
import Logo from "../../layout/header/logo";

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const validateName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]{3,}$/.test(name)) return "Name must be at least 3 characters and contain only letters";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^[\d\+\-\s]{10,}$/.test(phone)) return "Enter a valid phone number";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
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
          : name === "email"
          ? validateEmail(value)
          : name === "phone"
          ? validatePhone(value)
          : validatePassword(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({ name: nameError, email: emailError, phone: phoneError, password: passwordError });
    if (nameError || emailError || phoneError || passwordError) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Signup fail ho gaya');
        return;
      }

      localStorage.setItem("user", JSON.stringify({ user: data.data?.name || formData.name }));
      router.push("/");
    } catch (error) {
      console.error('Signup error:', error);
      alert('Kuch galat ho gaya, dobara koshish karein.');
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
            Sign Up Chiron
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1234567890"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-6">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black hover:opacity-90 px-5 py-3 text-base transition duration-300 ease-in-out font-medium shadow-md"
            >
              Register Chiron {loading && <Loader />}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SignUp;