import { cookies } from 'next/headers'

/**
 * Check if the current user is authenticated as admin
 * This is a simplified version for demo/development
 * In production, you would:
 * - Verify JWT tokens
 * - Check user roles from database
 * - Implement proper session management
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    const isAuth = session?.value === 'authenticated'
    console.log('Auth check - Cookie value:', session?.value, 'IsAuth:', isAuth)
    return isAuth
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

/**
 * Get the current admin session
 */
export async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (session?.value === 'authenticated') {
      return {
        isAuthenticated: true,
        user: {
          email: 'admin@robbiemoto.com',
          role: 'ADMIN',
        },
      }
    }
    
    return {
      isAuthenticated: false,
      user: null,
    }
  } catch (error) {
    console.error('Session error:', error)
    return {
      isAuthenticated: false,
      user: null,
    }
  }
}

