'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DealerRegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnicNumber: '',
    phoneNumber: '',
    companyName: '',
    companyAddress: '',
  });

  const [frontCnic, setFrontCnic] = useState<string | null>(null);
  const [backCnic, setBackCnic] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Automatic Formatting for CNIC: XXXXX-XXXXXXX-X (Max 15 chars)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Non-digits remove karein
    if (value.length > 13) value = value.slice(0, 13); // Max 13 digits total

    let formatted = value;
    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
    }

    setFormData({ ...formData, cnicNumber: formatted });
  };

  // Handle File Upload with 500KB Size Limit
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeBytes = 500 * 1024; // 500KB in bytes
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `The uploaded ${type === 'front' ? 'Front' : 'Back'} CNIC image exceeds the 500KB limit.`
        );
        e.target.value = ''; // Input clear karein
        if (type === 'front') setFrontCnic(null);
        if (type === 'back') setBackCnic(null);
        return;
      }

      setErrorMessage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') setFrontCnic(reader.result as string);
        if (type === 'back') setBackCnic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side CNIC Format Validation
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(formData.cnicNumber)) {
      setErrorMessage('Please enter a valid CNIC format (e.g., 33303-3332783-9).');
      return;
    }

    if (!frontCnic || !backCnic) {
      setErrorMessage('Please upload both Front and Back images of your CNIC (Max 500KB each).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/dealer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          frontCnicImage: frontCnic,
          backCnicImage: backCnic,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Registration failed. Please check your inputs.');
      } else {
        setSuccessMessage(result.message);
        setFormData({
          name: '',
          email: '',
          cnicNumber: '',
          phoneNumber: '',
          companyName: '',
          companyAddress: '',
        });
        setFrontCnic(null);
        setBackCnic(null);
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    'w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-4 py-3 text-white !text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition caret-white dark:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto mt-[100px] bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-indigo-500/20">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text font-bold text-xs tracking-widest uppercase">
            Partner Program
          </span>
          <h1 className="text-3xl text-white sm:text-4xl font-extrabold mt-1">Join as an Authorized Dealer</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-2">
            Fill out the form below with your company details and CNIC to register.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-100 text-xs sm:text-sm font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-xl text-emerald-100 text-xs sm:text-sm font-medium text-center">
            🎉 {successMessage}
            <div className="mt-3">
              <Link href="/dealer-status" className="underline font-bold text-emerald-300 hover:text-emerald-100">
                Click here to track your application status &rarr;
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                Full Name * <span className="text-gray-400 font-normal">(Max 50)</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                style={{ color: '#ffffff' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputStyle}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                Email Address * <span className="text-gray-400 font-normal">(Max 50)</span>
              </label>
              <input
                type="email"
                required
                maxLength={50}
                style={{ color: '#ffffff' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputStyle}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                CNIC Number * <span className="text-gray-400 font-normal">(e.g. 33303-3332783-9)</span>
              </label>
              <input
                type="text"
                required
                maxLength={15}
                style={{ color: '#ffffff' }}
                value={formData.cnicNumber}
                onChange={handleCnicChange}
                className={inputStyle}
                placeholder="33303-3332783-9"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                Phone Number * <span className="text-gray-400 font-normal">(Max 15)</span>
              </label>
              <input
                type="tel"
                required
                maxLength={15}
                style={{ color: '#ffffff' }}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={inputStyle}
                placeholder="+923001234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                Company Name * <span className="text-gray-400 font-normal">(Max 50)</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                style={{ color: '#ffffff' }}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className={inputStyle}
                placeholder="Chiron Properties"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                Company Address * <span className="text-gray-400 font-normal">(Max 50)</span>
              </label>
              <input
                type="text"
                required
                maxLength={50}
                style={{ color: '#ffffff' }}
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className={inputStyle}
                placeholder="Office #12, Commercial Area"
              />
            </div>
          </div>

          {/* CNIC Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-indigo-500/20">
            {/* Front CNIC */}
            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                CNIC Front Image * <span className="text-gray-400 font-normal">(Max 500KB)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleImageUpload(e, 'front')}
                className="w-full text-xs text-white file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-500 cursor-pointer"
              />
              {frontCnic && (
                <img
                  src={frontCnic}
                  alt="CNIC Front Preview"
                  className="mt-3 h-28 w-full object-cover rounded-xl border border-indigo-500/40"
                />
              )}
            </div>

            {/* Back CNIC */}
            <div>
              <label className="block text-xs font-semibold uppercase text-white mb-1">
                CNIC Back Image * <span className="text-gray-400 font-normal">(Max 500KB)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleImageUpload(e, 'back')}
                className="w-full text-xs text-white file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-500 cursor-pointer"
              />
              {backCnic && (
                <img
                  src={backCnic}
                  alt="CNIC Back Preview"
                  className="mt-3 h-28 w-full object-cover rounded-xl border border-indigo-500/40"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition duration-300 disabled:opacity-50 text-base mt-4"
          >
            {loading ? 'Submitting Application...' : 'Submit Dealer Application'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/80">
          Already applied?{' '}
          <Link href="/dealer-status" className="text-indigo-300 underline font-semibold hover:text-white">
            Check your Application Status
          </Link>
        </div>
      </div>
    </div>
  );
}