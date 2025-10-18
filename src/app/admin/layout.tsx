import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminLayout as AdminLayoutClient } from '@/components/admin/admin-layout-client'
import { isAdminAuthenticated } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await isAdminAuthenticated()
  
  console.log('Admin auth check:', isAuthenticated)
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}