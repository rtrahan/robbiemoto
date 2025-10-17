'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Gavel,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Manage Auctions', href: '/admin/auctions', icon: Gavel },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      <div className="flex h-20 items-center border-b border-gray-100 px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="font-serif text-xl font-light text-gray-900">Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 p-6">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-100 p-6">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900"
        >
          ← Back to Site
        </Link>
      </div>
    </div>
  )
}