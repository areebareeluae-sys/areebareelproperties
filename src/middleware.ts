import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define routes that require authentication
  const protectedRoutes = ["/my-properties", "/forgot-password"];

  // Check if the current path is one of the protected routes
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // Check for NextAuth session cookie or custom localStorage/cookie token
  // NextAuth default cookies: __Secure-next-auth.session-token or next-auth.session-token
  const nextAuthToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
    
  // If you also store a custom token/cookie for standard login, check it here
  const customUserToken = request.cookies.get("user")?.value;

  const isAuthenticated = Boolean(nextAuthToken || customUserToken);

  // If the route is protected and the user is NOT authenticated, redirect to /signin
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/my-properties/:path*", "/signup", "/forgot-password"],
};
