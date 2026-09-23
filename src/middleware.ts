import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/user") || path.startsWith("/my-properties");

  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Alag alag cookies read karein jo humne login par set ki hain
  const adminToken = request.cookies.get("admin_token")?.value;
  const userToken = request.cookies.get("user_token")?.value;

  // 1. Agar koi bhi login nahi hai (dono cookies gayab hain) -> Signin par bhejo
  if (!adminToken && !userToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 2. 🛑 STRICT SECURITY: Agar koi /admin route par ja raha hai
  // Lekin uske paas sirf client wali cookie hai (`user_token`), admin wali nahi (`admin_token`)
  if (isAdminRoute && !adminToken) {
    // Usay foran kick out kar ke home ya user page par bhej do!
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",     
    "/user/:path*",      
    "/my-properties/:path*" 
  ],
};