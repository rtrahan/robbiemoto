import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for data access
// This works on Vercel without IPv4 add-on (uses HTTPS REST API)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing')
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Helper to decide whether to use Prisma or Supabase
export const USE_SUPABASE_FOR_DATA = !process.env.DATABASE_URL || process.env.VERCEL

// Export singleton
export const supabaseServer = createServerSupabaseClient()


