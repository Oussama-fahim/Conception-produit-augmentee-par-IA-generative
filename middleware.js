import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'


export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Utilisez getUser() au lieu de getSession()
  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées - rediriger vers login si pas connecté
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirection si déjà connecté
  if ((request.nextUrl.pathname === '/login' || 
       request.nextUrl.pathname === '/register' ||
       request.nextUrl.pathname === '/forgot-password' ||
       request.nextUrl.pathname === '/auth/confirm') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}


// Dans middleware.js, mettre à jour le matcher
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/designers/:path*', 
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/confirm'
  ]
}