'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Logged out successfully')
        router.push('/admin-login')
        router.refresh()
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      toast.error('Failed to logout')
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center gap-2 border-l pl-2 md:pl-4">
      <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">admin@robbiemoto.com</span>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-xs"
      >
        <LogOut className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  )
}

export function AdminHeader() {
  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <LogoutButton />
      </div>
    </header>
  )
}