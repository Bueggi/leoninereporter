import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const allowedMembers = [
  "christopher.buecklein@leoninestudios.com",
  "edwin.tetteh@leoninestudios.com",
  "johannes.schmidbauer@leoninestudios.com",
  "christopher.buecklein@homeoftalents.de",
  "edwin.tetteh@homeoftalents.de",
  "johannes.schmidbauer@homeoftalents.de",
];

export default withAuth(
  function middleware(req) {

    console.log(req.nextauth.token.email)
    console.log(req.nextauth.token)
    if (!allowedMembers.some(el=> el.toLowerCase() === req.nextauth.token.email.toLowerCase())) {
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
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
