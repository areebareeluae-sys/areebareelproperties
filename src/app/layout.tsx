import { DM_Sans } from "next/font/google";
// @ts-ignore - CSS side-effect imports are handled by Next.js and may not be covered by project typings.
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Aoscompo from "@/utils/aos";
import NextTopLoader from 'nextjs-toploader';
import { AppContextProvider } from "../context-api/PropertyContext";
import Footer from "./components/layout/footer";
import ScrollToTop from "./components/scroll-to-top";
import Header from "./components/layout/header";
import SessionProviderComp from "./provider/SessionProviderComp";

const dmsans = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmsans.className}`}>
        <AppContextProvider>
          {/* Omit passing session here; let SessionProviderComp handle session fetching via auth() or Client side */}
          <SessionProviderComp>
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="light"
            >
              <Aoscompo>
                <Header />
                <NextTopLoader />
                
                {/* FIXED FLOATING SOCIAL MEDIA SIDEBAR (Poori Website ke liye) */}
                <div className="fixed right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-1 sm:p-2 rounded-lg sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
                  
                  {/* Facebook */}
                  <a 
                    href="https://www.facebook.com/people/Chiron-Properties/61582566633987/#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-xl bg-blue-600 text-white hover:scale-110 transition shadow-md"
                    title="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.75V8z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="https://www.instagram.com/chironproperties_/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white hover:scale-110 transition shadow-md"
                    title="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a 
                    href="https://www.youtube.com/@ChironProperties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-xl bg-red-600 text-white hover:scale-110 transition shadow-md"
                    title="YouTube"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* TikTok */}
                  <a 
                    href="https://www.tiktok.com/@chironproperties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-md sm:rounded-xl bg-black text-white hover:scale-110 transition shadow-md"
                    title="TikTok"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>

                </div>

                {children}
                <Footer />
              </Aoscompo>
              <ScrollToTop />
            </ThemeProvider>
          </SessionProviderComp>
        </AppContextProvider>
      </body>
    </html>
  );
}