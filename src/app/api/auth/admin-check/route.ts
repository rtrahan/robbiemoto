import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // If admin email, set admin cookie
    const adminEmails = ['admin@robbiemoto.com', 'robbiemoto@gmail.com']
    if (adminEmails.includes(email?.toLowerCase())) {
      const cookieStore = await cookies()
      
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      
      return NextResponse.json({ isAdmin: true })
    }
    
    return NextResponse.json({ isAdmin: false })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

