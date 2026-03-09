// Middleware - Kimlik doğrulama kontrolü
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Seller route protection
  if (path.startsWith('/seller') && !path.startsWith('/seller/login')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/seller/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/seller/:path*'],
}
