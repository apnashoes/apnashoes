import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Define the path to your admin login page
const ADMIN_LOGIN_PATH = "/admin/login";

export async function middleware(req) {
  // 1. Retrieve the token from the cookie
  const token = req.cookies.get("adminToken")?.value;
  const url = req.nextUrl;
  console.log("🔥 Middleware is running on:", req.nextUrl.pathname);
  // 2. Define if the current path is a protected admin route
  // A route is protected if it starts with /admin AND is NOT the login page.
  const isProtectedAdminRoute =
    url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith(ADMIN_LOGIN_PATH);

  // If the route is not a protected admin route, let the request pass immediately.
  if (!isProtectedAdminRoute) {
    return NextResponse.next();
  }

  // --- PROTECTED ROUTE LOGIC ---

  // 3. Check for the existence of the token
  if (!token) {
    // If no token, redirect to the login page
    url.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  // 4. Verify the token
  try {
    // Ensure the JWT_SECRET is accessed outside the try/catch if you use `process.env`
    // Convert secret to Uint8Array (required by jose)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // This throws an error if the token is invalid or expired
    await jwtVerify(token, secret); 
    
    // Token is valid, allow access
    return NextResponse.next();

  } catch (err) {
    // If verification fails (e.g., token expired, tampered)
    console.error("JWT Verification failed:", err.message);
    
    // Redirect to the login page
    url.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(url);
  }
}


export const config = {
  // The matcher is correct: run the middleware for all paths under /admin/
  matcher: ["/admin/:path*"],
};