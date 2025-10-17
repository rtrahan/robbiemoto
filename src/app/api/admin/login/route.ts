import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Demo admin credentials
const DEMO_ADMIN_EMAIL = 'admin@robbiemoto.com'
const DEMO_ADMIN_PASSWORD = 'admin123'

// In production, you would:
// 1. Hash passwords
// 2. Check against database
// 3. Use proper JWT tokens
// 4. Implement rate limiting
// This is a simplified version for demo/development

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      // Create response
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
      })
      
      // Set a simple session cookie (in production, use proper JWT)
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      console.log('Login successful, cookie set for:', email)
      
      return response
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

