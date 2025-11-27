// middleware.js

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ALLOWED_EMAILS = new Set([
  "christopher.buecklein@homeoftalents.de",
  "edwin.tetteh@homeoftalents.de",
  "johannes.schmidbauer@homeoftalents.de",
  "christopher.buecklein@leoninestudios.com",
  "edwin.tetteh@leoninestudios.com",
  "johannes.schmidbauer@leoninestudios.com",
  "business.chris.buck@gmail.com",
]);

export default withAuth(
  function middleware(req) {
    const email = req.nextauth.token?.email;
    
    // Nicht in der Whitelist → Access Denied
    if (!email || !ALLOWED_EMAILS.has(email)) {
      return NextResponse.rewrite(new URL("/accessDenied", req.url));
    }
    
    // Token Error (z.B. Refresh failed) → Re-Login
    if (req.nextauth.token?.error === "RefreshTokenError") {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};