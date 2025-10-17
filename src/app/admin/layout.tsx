import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Always use simple admin auth (cookie-based)
  // In production, you'd check Supabase user role here
  const isAuthenticated = await isAdminAuthenticated()
  
  console.log('Admin auth check:', isAuthenticated)
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}