'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Search, LogOut } from 'lucide-react'
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
    <div className="flex items-center gap-2 border-l pl-4">
      <span className="text-sm text-gray-600">admin@robbiemoto.com</span>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}

export function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search auctions, lots, users..."
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </Button>
        
        <LogoutButton />
      </div>
    </header>
  )
}