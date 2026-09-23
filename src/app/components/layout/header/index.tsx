"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Logo from "./logo";
import HeaderLink from "./navigation/HeaderLink";
import MobileHeaderLink from "./navigation/MobileHeaderLink";

const Header: React.FC = () => {
  const pathUrl = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Country Toggle State
  const [currentCountry, setCurrentCountry] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 80);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    // Check saved country and selection status flag
    const savedCountry = localStorage.getItem("selected_country");
    const isCountrySelected = localStorage.getItem("is_country_selected");

    if (savedCountry) {
      setCurrentCountry(savedCountry);
    }

    if (!isCountrySelected) {
      // Yahan mazeed actions trigger kiye ja sakte hain agar zaroorat ho
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarOpen]);

  // Country switch handler (Jab user khud UAE ya PK click karega)
  const handleCountryToggle = (country: string) => {
    setCurrentCountry(country);
    localStorage.setItem("selected_country", country);
    localStorage.setItem("is_country_selected", "true");
    window.location.reload();
  };

  // localStorage se user read karna aur role detect karna
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, [pathUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/layoutdata');
        if (!res.ok) throw new Error('Failed to fetch');

        const apiData = await res.json();
        setData(apiData?.headerData || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    document.cookie = "admin_token=; path=/; max-age=0"; 
    document.cookie = "user_token=; path=/; max-age=0"; 
    signOut({ redirect: false });
    setUser(null);
    setIsDropdownOpen(false);
    
    window.location.href = "/";
  };

  const isOfficeUser = user?.role === 'office';
  const isLoggedIn = Boolean(user || session?.user);

  // Database ke mutabiq department key fetch karna
  const userDept = user?.departmentId || user?.department || user?.userRole;

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-transparent transition-all ${
        sticky ? "shadow-lg dark:shadow-darkmd bg-white dark:bg-semidark" : "shadow-none bg-white dark:bg-darkmode"
      }`}
    >
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 py-3">
        {/* Top Row: Logo (Left) & Controls/Buttons (Right) */}
        <div className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center space-x-3">
            {/* Country Toggle Button: Left UAE, Right PK */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-dark_border p-1 rounded-lg border border-gray-300 dark:border-dark_border">
              <button
                type="button"
                onClick={() => handleCountryToggle("UAE")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentCountry === "UAE"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-body-color dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                UAE
              </button>
              <button
                type="button"
                onClick={() => handleCountryToggle("PK")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentCountry === "PK"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "text-body-color dark:text-gray-300 hover:text-black dark:hover:text-white"
                }`}
              >
                PK
              </button>
            </div>

            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center text-body-color duration-300 dark:text-white"
            >
              <svg viewBox="0 0 16 16" className="hidden h-6 w-6 dark:block">
                <path d="M4.50663 3.2267L3.30663 2.03337L2.36663 2.97337L3.55996 4.1667L4.50663 3.2267ZM2.66663 7.00003H0.666626V8.33337H2.66663V7.00003ZM8.66663 0.366699H7.33329V2.33337H8.66663V0.366699V0.366699ZM13.6333 2.97337L12.6933 2.03337L11.5 3.2267L12.44 4.1667L13.6333 2.97337ZM11.4933 12.1067L12.6866 13.3067L13.6266 12.3667L12.4266 11.1734L11.4933 12.1067ZM13.3333 7.00003V8.33337H15.3333V7.00003H13.3333ZM7.99996 3.6667C5.79329 3.6667 3.99996 5.46003 3.99996 7.6667C3.99996 9.87337 5.79329 11.6667 7.99996 11.6667C10.2066 11.6667 12 9.87337 12 7.6667C12 5.46003 10.2066 3.6667 7.99996 3.6667ZM7.33329 14.9667H8.66663V13H7.33329V14.9667ZM2.36663 12.36L3.30663 13.3L4.49996 12.1L3.55996 11.16L2.36663 12.36Z" fill="currentColor" />
              </svg>
              <svg viewBox="0 0 23 23" className="h-8 w-8 text-dark dark:hidden">
                <path d="M16.6111 15.855C17.591 15.1394 18.3151 14.1979 18.7723 13.1623C16.4824 13.4065 14.1342 12.4631 12.6795 10.4711C11.2248 8.47905 11.0409 5.95516 11.9705 3.84818C10.8449 3.9685 9.72768 4.37162 8.74781 5.08719C5.7759 7.25747 5.12529 11.4308 7.29558 14.4028C9.46586 17.3747 13.6392 18.0253 16.6111 15.855Z" />
              </svg>
            </button>

            {/* Desktop Independent Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                href="/hissa"
                className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
              >
                Hissa Eligibility
              </Link>
              
            </div>

            {/* User Profile / Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Image
                    src={"/images/avatar/avatar_1.jpg"}
                    alt="avatar"
                    width={38}
                    height={38}
                    className="rounded-full border-2 border-primary"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-semidark rounded-lg shadow-xl border border-border dark:border-dark_border py-2 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-border dark:border-dark_border mb-1">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {user?.name || session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-purple-600 font-medium capitalize">
                         {user?.role || 'Client'} {userDept ? `(${userDept})` : ""}
                      </p>
                    </div>
                    
                    {isOfficeUser ? (
                      <>
                        {(userDept === 'dept_1' || userDept === 'dept_2') && (
                          <>
                            <Link href="/admin/applications" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Client Applications</Link>
                            <Link href="/admin/cnic-status" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">CNIC Status</Link>
                          </>
                        )}

                        {userDept === 'dept_3' && (
                          <>
                            <Link href="/admin/signup" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Create Client User</Link>
                            <Link href="/admin/my-inventory" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Add Inventory</Link>
                            <Link href="/admin/my-properties" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Add Property</Link>
                            <Link href="/admin/close-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">Close Client</Link>
                            <Link href="/admin/banners" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">add Banners</Link>
                            <Link href="/admin/reactivate-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-green-500 hover:bg-gray-100 dark:hover:bg-dark_border">Open Client</Link>
                            <Link href="/admin/cnic-status" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-dark_border">CNIC Status</Link>
                            <Link href="/admin/deactivate-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">Deactivate Client</Link>
                          </>
                        )}

                        {(!['dept_1', 'dept_2', 'dept_3'].includes(userDept)) && (
                          <>
                            <Link href="/admin/office-users/create" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Create Office User</Link>
                            <Link href="/admin/signup" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Create Client User</Link>
                            <Link href="/admin/my-inventory" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Add Inventory</Link>
                            <Link href="/admin/my-properties" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Add Property</Link>
                            <Link href="/admin/close-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">Close Client</Link>
                            <Link href="/admin/banners" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">add Banners</Link>
                            <Link href="/admin/reactivate-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-green-500 hover:bg-gray-100 dark:hover:bg-dark_border">Open Client</Link>
                            <Link href="/admin/cnic-status" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-dark_border">CNIC Status</Link>
                            <Link href="/admin/deactivate-client" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-dark_border">Deactivate Client</Link>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="/user/transactions" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">My Account</Link>
                                           <Link href="/user/pin-settings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Transactions Pin</Link>
                                           <Link href="/user/change-password" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark_border">Change Password</Link>

                      </>
                    )}

                    <div className="border-t border-border dark:border-dark_border my-1"></div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-dark_border transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
              <Link
                href="/signin"
                className="hidden lg:block bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-sm"
              >
                Login
              </Link>
               <Link
                href="/signup"
                className="hidden lg:block bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-sm"
              >
                Signup
              </Link></>
            )}

            <button
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="block lg:hidden p-2 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              <span className="block w-6 h-0.5 bg-black dark:bg-white"></span>
              <span className="block w-6 h-0.5 bg-black dark:bg-white mt-1.5"></span>
              <span className="block w-6 h-0.5 bg-black dark:bg-white mt-1.5"></span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Menu Links (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-center pt-3 border-t border-border dark:border-dark_border mt-3">
          <nav className="flex items-center space-x-6 flex-wrap justify-center">
            {isOfficeUser ? (
              <>
                {(userDept === 'dept_1' || userDept === 'dept_2') && (
                  <Link href="/admin/applications" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Client Applications</Link>
                )}

                {userDept === 'dept_3' && (
                  <>
                    <Link href="/admin/applications" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Client Applications</Link>
                    <Link href="/admin/assign-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Assign Inventory</Link>
                    <Link href="/admin/transfer-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Transfer Inventory</Link>
                    <Link href="/admin/upgrade-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Upgrade Inventory</Link>
                    <Link href="/admin/transfer-cash" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Transfer Cash</Link>            
                    <Link href="/admin/TransactionHistoryPage" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">TransactionHistory</Link>              
                  </>
                )}

                {(!['dept_1', 'dept_2', 'dept_3'].includes(userDept)) && (
                  <>
                    <Link href="/admin/dashboard" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Dashboard</Link>
                    <Link href="/admin/applications" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Client Applications</Link>
                    <Link href="/admin/assign-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Assign Inventory</Link>
                    <Link href="/admin/transfer-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Transfer Inventory</Link>
                    <Link href="/admin/upgrade-inventory" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Upgrade Inventory</Link>
                    <Link href="/admin/transfer-cash" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">Transfer Cash</Link>            
                    <Link href="/admin/TransactionHistoryPage" className="text-sm font-medium text-dark dark:text-white hover:text-blue-600">TransactionHistory</Link>              
                  </>
                )}
              </>
            ) : (
              data.map((item: any, index: any) => (
                <HeaderLink key={index} item={item} />
              ))
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Off-Canvas Menu Drawer */}
      {navbarOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" />
      )}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 z-50 right-0 h-full w-full bg-white dark:bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark_border">
          <h2 className="text-lg font-bold text-midnight_text dark:text-white">
            {isOfficeUser ? "Office Menu" : "Menu"}
          </h2>
          <button type="button" onClick={() => setNavbarOpen(false)} aria-label="Close mobile menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="dark:text-white">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col items-start p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          {isOfficeUser ? (
            <>
              {(userDept === 'dept_1' || userDept === 'dept_2') && (
                <>
                  <Link href="/admin/applications" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Client Applications</Link>
                  <Link href="/admin/cnic-status" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">CNIC Status</Link>
                </>
              )}

              {userDept === 'dept_3' && (
                <>
                  <Link href="/admin/applications" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Client Applications</Link>
                  <Link href="/admin/cnic-status" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">CNIC Status</Link>
                  <Link href="/admin/my-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Add Inventory</Link>
                  <Link href="/admin/my-properties" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Add Property</Link>
                  <Link href="/admin/assign-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Assign Inventory</Link>
                  <Link href="/admin/transfer-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Transfer Inventory</Link>
                  <Link href="/admin/TransactionHistoryPage" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">TransactionHistory</Link>
                  <Link href="/admin/upgrade-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Upgrade Inventory</Link>
                  <Link href="/admin/close-client" onClick={() => setNavbarOpen(false)} className="text-red-500 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Close Client</Link>
                           <Link href="/admin/banners" onClick={() => setNavbarOpen(false)} className="text-red-500 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Add Banners</Link>
        
                  <Link href="/admin/reactivate-client" onClick={() => setNavbarOpen(false)} className="text-green-500 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Reactivate Client</Link>
                  <Link href="/admin/deactivate-client" onClick={() => setNavbarOpen(false)} className="text-red-500 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Deactivate Client</Link>
                </>
              )}

              {(!['dept_1', 'dept_2', 'dept_3'].includes(userDept)) && (
                <>
                  <Link href="/admin/dashboard" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Dashboard</Link>
                  <Link href="/admin/applications" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Client Applications</Link>
                  <Link href="/admin/assign-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Assign Inventory</Link>
                  <Link href="/admin/transfer-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Transfer Inventory</Link>
                  <Link href="/admin/upgrade-inventory" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Upgrade Inventory</Link>
                  <Link href="/admin/transfer-cash" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Transfer Cash</Link>
                  <Link href="/admin/TransactionHistoryPage" onClick={() => setNavbarOpen(false)} className="text-dark dark:text-white py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark_border text-sm font-medium w-full">Transaction History</Link>           
                </>
              )}
            </>
          ) : (
            data.map((item: any, index: any) => (
              <MobileHeaderLink key={index} item={item} />
            ))
          )}

          <div className="mt-4 flex flex-col space-y-3 w-full pt-4 border-t border-border dark:border-dark_border">
            <Link
              href="/hissa"
              onClick={() => setNavbarOpen(false)}
              className="bg-black text-white dark:bg-white dark:text-black text-center py-2 px-4 rounded-lg hover:opacity-95 transition-colors text-sm font-medium w-full"
            >
              Hissa Eligibility
            </Link>
            

            {isLoggedIn ? (
              <button
                type="button"
                className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white w-full text-center text-sm font-medium mt-2"
                onClick={() => handleSignOut()}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/signin"
                className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white text-center text-sm w-full"
                onClick={() => setNavbarOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;