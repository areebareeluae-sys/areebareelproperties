"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/shared/Loader";

export default function PinSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUserData(parsedUser);

    if (!parsedUser.cnic) {
      setLoading(false);
      return;
    }

    // Check if PIN is already created for this user
    const checkPinStatus = async () => {
      try {
        const res = await fetch(`/api/user/pin?cnic=${parsedUser.cnic}`);
        const result = await res.json();
        if (result.success) {
          setHasPin(result.hasPin);
        }
      } catch (error) {
        console.error("Failed to check PIN status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPinStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setMessage({ text: "Please enter a valid PIN with at least 4 digits", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData?.id || userData?.cnic,
          cnic: userData?.cnic,
          pin: pin,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ 
          text: hasPin ? "PIN changed successfully!" : "New PIN created successfully!", 
          type: "success" 
        });
        setHasPin(true);
        setPin("");
      } else {
        setMessage({ text: result.message || "Something went wrong, please try again", type: "error" });
      }
    } catch (error) {
      console.error("Error saving PIN:", error);
      setMessage({ text: "Server error occurred", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkmode">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 sm:px-8 bg-light dark:bg-darkmode text-dark dark:text-white">
      <div className="max-w-md mx-auto bg-white dark:bg-semidark p-6 sm:p-8 rounded-2xl shadow-lg border border-border dark:border-dark_border space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-extrabold mb-2">
            {hasPin ? "Change Your PIN" : "Set New PIN"}
          </h1>
          <p className="text-sm text-gray-500">
            {hasPin 
              ? "Your PIN is already created. You can easily change your PIN from here." 
              : "You don't have a PIN yet. Please set a new PIN."}
          </p>
        </div>

        {/* User Info Box */}
        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl text-sm space-y-2">
          <div><span className="text-gray-400 font-medium">Name:</span> <span className="font-semibold ml-2">{userData?.name || "N/A"}</span></div>
          <div><span className="text-gray-400 font-medium">CNIC:</span> <span className="font-semibold ml-2">{userData?.cnic || "N/A"}</span></div>
          <div><span className="text-gray-400 font-medium">Customer ID:</span> <span className="font-mono ml-2">{userData?.id || userData?.cnic || "N/A"}</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">
              {hasPin ? "Enter New PIN" : "Enter PIN"}
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter secure PIN"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-dark_border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-base font-mono"
              required
            />
          </div>

          {message.text && (
            <p className={`text-sm text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Processing..." : hasPin ? "Update PIN" : "Save PIN"}
          </button>
        </form>

      </div>
    </div>
  );
}