import {withAuth} from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const adminRoutes = []

export default withAuth(
    function middleware(req) {

        const isAdmin = adminRoutes.some(e => e.startsWith(req.nextUrl.pathname))
        console.log(isAdmin)
 
        if (isAdmin && req.nextauth.token.role !== 'ADMIN' ) {
            return NextResponse.rewrite(new URL('/accessDenied', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({token}) => !!token
        }
    }
)

export const config = {matcher: ['/api/protected/:path', '/loginTest']}