'use client'

import { useEffect, useState } from 'react'
import { getUser, signOut } from '@/lib/supabase-auth'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function AuthHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const userData = await getUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-xs text-gray-400">
        ...
      </div>
    )
  }

  if (user) {
    // Check if user is admin
    const adminEmails = ['admin@robbiemoto.com', 'robbiemoto@gmail.com']
    const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')
    
    // User is logged in - show profile menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="text-xs hidden md:inline">{user.email?.split('@')[0]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                <Settings className="h-4 w-4 mr-2" />
                Admin Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            <User className="h-4 w-4 mr-2" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/')}>
            🏺 Browse Auction
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Not logged in - show sign in
  return (
    <a 
      href="/login"
      className="text-xs uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors font-medium"
    >
      Sign In
    </a>
  )
}

