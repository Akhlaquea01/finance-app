import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup']

/**
 * WARNING: Client-side JWT validation is NOT secure!
 * This is only for UX purposes (redirecting expired sessions).
 * The server MUST validate all tokens on protected API routes.
 * 
 * An attacker can:
 * 1. Modify the JWT payload (but not the signature)
 * 2. Bypass this check entirely by modifying the client code
 * 3. Use an expired token if server doesn't validate
 * 
 * This middleware only checks token expiration for better UX.
 * Server-side validation is REQUIRED for security.
 */
function decodeJWT(token: string) {
    try {
        // WARNING: This does NOT verify the signature!
        // Only the server can securely verify JWT signatures
        const base64Payload = token.split('.')[1]
        if (!base64Payload) return null
        const decodedPayload = Buffer.from(base64Payload, 'base64').toString()
        return JSON.parse(decodedPayload)
    } catch (err) {
        return null
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('finTrac_token')?.value
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

    // Decode and check expiration (UX only - server must validate!)
    const decoded = decodeJWT(token)
    const isExpired = !decoded || !decoded.exp || decoded.exp * 1000 < Date.now()

    if (isExpired) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)

        // Clear the expired cookies
        const response = NextResponse.redirect(loginUrl)
        response.cookies.set('finTrac_token', '', { maxAge: 0, path: '/' })
        response.cookies.set('accessToken', '', { maxAge: 0, path: '/' })
        response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' })

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
