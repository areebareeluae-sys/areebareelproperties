"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // States
  const [identifier, setIdentifier] = useState(""); // CNIC
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Verify CNIC & PIN, Step 2: New Password

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // CNIC Auto-formatting function (e.g., 33303-3332783-9)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Sirf numbers allow karein
    if (value.length > 13) value = value.slice(0, 13); // Max 13 digits raw numbers

    let formatted = "";
    if (value.length > 5) {
      formatted = value.slice(0, 5) + "-" + value.slice(5, 12);
      if (value.length > 12) {
        formatted += "-" + value.slice(12, 13);
      }
    } else {
      formatted = value;
    }

    setIdentifier(formatted);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (step === 1) {
        // Step 1: Verify CNIC & PIN
        const res = await fetch("/api/user/forget-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, pin, action: "verify-pin" }),
        });
        const result = await res.json();
        if (result.success) {
          setMessage({ text: "PIN verified successfully! Now enter your new password.", type: "success" });
          setStep(2);
        } else {
          setMessage({ text: result.message || "Invalid CNIC or PIN.", type: "error" });
        }
      } else {
        // Step 2: Reset Password
        const res = await fetch("/api/user/forget-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, pin, newPassword, action: "reset-password" }),
        });
        const result = await res.json();
        if (result.success) {
          setMessage({ text: "Password reset successful! Redirecting to sign in...", type: "success" });
          setTimeout(() => router.push("/signin"), 2000);
        } else {
          setMessage({ text: result.message || "Failed to reset password.", type: "error" });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ text: "Server error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 bg-light dark:bg-darkmode text-dark dark:text-white flex justify-center items-center">
      <div className="max-w-md w-full bg-white dark:bg-semidark p-6 sm:p-8 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-6">
        
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-extrabold mb-1">
            Forgot Password
          </h1>
          <p className="text-xs text-gray-500">
            {step === 1 
              ? "Enter your CNIC and account PIN to verify your identity." 
              : "Enter your new secure password below."}
          </p>
        </div>

        {/* Status Message */}
        {message.text && (
          <p className={`text-xs text-center font-medium p-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {message.text}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">CNIC Number</label>
                <input
                  type="text"
                  value={identifier}
                  maxLength={15}
                  onChange={handleCnicChange}
                  placeholder="33303-3332783-9"
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Format: 33303-3332783-9</span>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Account PIN</label>
                <input
                  type="password"
                  maxLength={25}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your secure PIN"
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify PIN"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  maxLength={25}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </form>

      </div>
    </div>
  );
}