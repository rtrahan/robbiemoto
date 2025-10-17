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
      
      // Generate a cuid-like ID
      const generateId = () => {
        const timestamp = Date.now().toString(36)
        const randomStr = Math.random().toString(36).substring(2, 15)
        return `cm${timestamp}${randomStr}`.substring(0, 25)
      }
      
      // Create new user with generated ID
      const { data: user, error } = await supabaseServer
        .from('User')
        .insert({
          id: generateId(),
          clerkId: supabaseId,
          email,
          name,
          alias: name,
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase user creation error - FULL DETAILS:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        
        return NextResponse.json(
          { 
            error: 'Database insert failed', 
            details: error.message,
            code: error.code,
            hint: error.hint,
          },
          { status: 500 }
        )
      }

      console.log('✅ User created via Supabase:', user.id)
      return NextResponse.json({ success: true, user })
    }
  } catch (error: any) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    )
  }
}

