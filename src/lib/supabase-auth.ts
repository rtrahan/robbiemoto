import { createClient } from '@supabase/supabase-js'

// This runs on the client, so we need to use window for environment access
function getSupabaseClient() {
  // Get from public env var (available on client)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!anonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found - auth will not work')
    return null
  }
  
  // Extract project ID from the anon key or hardcode
  const supabaseUrl = 'https://bdyuqcxtdawxhhdxgkic.supabase.co'
  
  return createClient(supabaseUrl, anonKey)
}

export const supabase = getSupabaseClient()

// Client-side auth helpers
export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Don't require email confirmation in dev
    },
  })
  
  if (error) throw error
  return { data }
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  if (!supabase) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  if (!supabase) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

