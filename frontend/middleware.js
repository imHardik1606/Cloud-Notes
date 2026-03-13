import { NextResponse } from "next/server";

export async function middleware(request) {
    const pathname = request.url.pathname;

    //Routes that require authentication
    const protectedRoutes = ['/dashboard'];
       
    //Check is current route is protected
    const isProtected = protectedRoutes.some(route => 
        pathname.startsWith(route)
    )

    if(isProtected) {
        //check if session cookie exists
        const hasCookie = request.cookie.has("session");

        if(!hasCookie) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*']
}