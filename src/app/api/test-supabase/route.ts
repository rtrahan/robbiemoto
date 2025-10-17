import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
  const projectId = match ? match[1] : null
  
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    hasAnonKey: !!anonKey,
    anonKeyLength: anonKey.length,
    projectId: projectId,
    supabaseUrl: projectId ? `https://${projectId}.supabase.co` : null,
    anonKeyPreview: anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET'
  })
}

