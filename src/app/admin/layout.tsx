"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    // Agar user logged in nahi hai toh signin par bhej dein
    if (!storedUser) {
      router.push("/signin");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const role = user?.role;
      const dept = user?.departmentId || user?.department || user?.userRole;

      // Agar role office nahi hai
      if (role !== "office") {
        router.push("/");
        return;
      }

      // --- DEPARTMENT WISE ALLOWED PAGES ---
      
      // 1. Dept 1 & Dept 2 ke liye sirf yehi page allowed hai
      const dept1And2Allowed = ["/admin/applications"];

      // 2. Dept 3 ke liye ye pages allowed hain
      const dept3Allowed = [
        "/admin/applications",
        "/admin/my-inventory",
        "/admin/close-client",
        "/admin/banners",
        "/admin/customer-payment",
        "/admin/cnic-status",
        "/admin/cash-received",
        "/admin/my-properties",
        "/admin/assign-inventory",
        "/admin/transfer-inventory",
        "/admin/deactivate-client",
        "/admin/TransactionHistoryPage",
      ];

      // Check logic
      if (dept === "dept_0") {
        // dept_0 ke liye dashboard bilkul ban hai, usay inventory par bhej dein
        if (pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/")) {
          router.replace("/admin/my-inventory");
          return;
        }
      } 
      else if (dept === "dept_1" || dept === "dept_2") {
        const isAllowed = dept1And2Allowed.some((path) => pathname === path || pathname.startsWith(path + "/"));
        if (!isAllowed) {
          router.push("/admin/applications"); 
          return;
        }
      } 
      else if (dept === "dept_3") {
        const isAllowed = dept3Allowed.some((path) => pathname === path || pathname.startsWith(path + "/"));
        if (!isAllowed) {
          router.push("/admin/applications"); 
          return;
        }
      }
      // Dept 4 ya baqi admins ke liye sab pages open rahenge

      setAuthorized(true);
    } catch (e) {
      console.error("Authorization check failed", e);
      router.push("/signin");
    }
  }, [pathname, router]);

  // Jab tak check ho raha hai, screen blank ya loading dikhayein
  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-darkmode">
        <p className="text-sm font-medium text-dark dark:text-white animate-pulse">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}