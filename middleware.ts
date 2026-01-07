// Middleware - Kimlik doğrulama kontrolü
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Middleware'i geçici olarak devre dışı bırak
  // Admin sayfası kendi içinde kontrol yapacak
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
