import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup']

function decodeJWT(token: string) {
    try {
        const base64Payload = token.split('.')[1]
        const decodedPayload = Buffer.from(base64Payload, 'base64').toString()
        return JSON.parse(decodedPayload)
    } catch (err) {
        return null
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('finTrac_token')?.value
    const { pathname } = request.nextUrl

    // Allow access to public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Decode and check expiration
    const decoded = decodeJWT(token)
    const isExpired = !decoded || decoded.exp * 1000 < Date.now()

    if (isExpired) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)

        // Clear the expired cookie
        const response = NextResponse.redirect(loginUrl)
        response.cookies.set('finTrac_token', '', { maxAge: 0, path: '/' })

        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
