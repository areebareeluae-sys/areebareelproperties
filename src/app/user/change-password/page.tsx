"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"change" | "forget">("change");
  
  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Forget / Pin Verify States
  const [identifier, setIdentifier] = useState(""); // CNIC
  const [pin, setPin] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Verify PIN, Step 2: New Password

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Handle Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser?.id;

    if (!userId) {
      setMessage({ text: "User ID not found. Please sign in again.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ text: "Password changed successfully!", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ text: result.message || "Something went wrong.", type: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ text: "Server error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Forget Password via PIN Verify
  const handleForgetPassword = async (e: React.FormEvent) => {
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
          body: JSON.stringify({ identifier, pin, newPassword: resetNewPassword, action: "reset-password" }),
        });
        const result = await res.json();
        if (result.success) {
          setMessage({ text: "Password reset successful! You can now log in.", type: "success" });
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
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab("change"); setMessage({ text: "", type: "" }); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${
              activeTab === "change" 
                ? "bg-primary text-white shadow" 
                : "text-gray-500 hover:text-dark dark:hover:text-white"
            }`}
          >
            Change Password
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("forget"); setMessage({ text: "", type: "" }); setStep(1); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${
              activeTab === "forget" 
                ? "bg-primary text-white shadow" 
                : "text-gray-500 hover:text-dark dark:hover:text-white"
            }`}
          >
            Forget Password (PIN)
          </button>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-extrabold mb-1">
            {activeTab === "change" ? "Change Your Password" : "Reset Password via PIN"}
          </h1>
          <p className="text-xs text-gray-500">
            {activeTab === "change" 
              ? "Provide your current password to set a new one." 
              : "Enter your CNIC and secure PIN to verify and reset your password."}
          </p>
        </div>

        {/* Status Message */}
        {message.text && (
          <p className={`text-xs text-center font-medium p-2 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {message.text}
          </p>
        )}

        {/* Change Password Form */}
        {activeTab === "change" ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Update Password"}
            </button>
          </form>
        ) : (
          /* Forget Password via PIN Form */
          <form onSubmit={handleForgetPassword} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-400 mb-1">CNIC</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your CNIC"
                    className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Your Account PIN</label>
                  <input
                    type="password"
                    maxLength={6}
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
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
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
        )}

      </div>
    </div>
  );
}