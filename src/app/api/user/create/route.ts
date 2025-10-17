import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, supabaseId } = await request.json()
    
    console.log('Creating user in database:', { email, name, supabaseId })
    
    // Try Prisma first
    try {
      const user = await prisma.user.create({
        data: {
          clerkId: supabaseId,
          email,
          name,
          alias: name,
        },
      })

      console.log('User created via Prisma:', user.id)
      return NextResponse.json({ success: true, user })
    } catch (prismaError) {
      console.log('Prisma failed, using Supabase to create user')
      
      // Fallback to Supabase
      const { supabaseServer } = await import('@/lib/supabase-server')
      
      if (!supabaseServer) {
        throw new Error('No database connection')
      }
      
      // Check if user already exists
      const { data: existing } = await supabaseServer
        .from('User')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      
      if (existing) {
        console.log('User already exists:', existing.id)
        return NextResponse.json({ success: true, user: existing })
      }
      
      // Create new user
      const { data: user, error } = await supabaseServer
        .from('User')
        .insert({
          clerkId: supabaseId,
          email,
          name,
          alias: name,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Supabase user creation error:', error)
        throw error
      }

      console.log('User created via Supabase:', user.id)
      return NextResponse.json({ success: true, user })
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}

