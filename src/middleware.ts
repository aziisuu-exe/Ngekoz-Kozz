import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'admin') return NextResponse.redirect(new URL('/', nextUrl)) 
  }

  if (nextUrl.pathname.startsWith('/owner')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (role !== 'owner' && role !== 'admin') return NextResponse.redirect(new URL('/', nextUrl))
  }

  if (nextUrl.pathname.startsWith('/reservasi')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}