import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const allowedMembers = [
  "christopher.buecklein@leoninestudios.com",
  "edwin.tetteh@leoninestudios.com",
  "johannes.schmidbauer@leoninestudios.com",
];

export default withAuth(
  function middleware(req) {
    if (!allowedMembers.includes(req.nextauth.token.email)) {
      return NextResponse.rewrite(new URL("/accessDenied", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/api/protected/:path",
    "/loginTest",
    "/dashboard/:path",
    "/api/:path",
  ],
};
