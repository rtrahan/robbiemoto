import { createClient } from '@supabase/supabase-js'

// Extract Supabase URL and create anon key from database URL
// Your DATABASE_URL: postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
// Becomes: https://PROJECT_ID.supabase.co

function getSupabaseConfig() {
  const dbUrl = process.env.DATABASE_URL || ''
  
  // Extract project ID from database URL
  const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
  const projectId = match ? match[1] : null
  
  if (!projectId) {
    console.warn('Could not extract Supabase project ID from DATABASE_URL')
    return null
  }
  
  const supabaseUrl = `https://${projectId}.supabase.co`
  
  // For storage, we need the anon key
  // You'll need to add this to your .env.local
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found - storage features disabled')
    return null
  }
  
  return { supabaseUrl, supabaseAnonKey }
}

export function getSupabaseClient() {
  const config = getSupabaseConfig()
  
  if (!config) {
    return null
  }
  
  return createClient(config.supabaseUrl, config.supabaseAnonKey)
}

export const supabase = getSupabaseClient()


