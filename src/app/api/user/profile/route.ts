import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let authUser = null
    
    if (token) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdyuqcxtdawxhhdxgkic.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )
      
      const { data } = await supabase.auth.getUser(token)
      authUser = data?.user
    }
    
    if (!authUser || !authUser.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    try {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: authUser.email },
      select: {
        id: true,
        email: true,
        name: true,
        alias: true,
        shippingAddress: true,
        shippingCity: true,
        shippingState: true,
        shippingZip: true,
        createdAt: true,
      },
      })
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(user)
    } catch (dbError) {
      console.log('Database not available')
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let authUser = null
    let supabase = null
    
    if (token) {
      const { createClient } = await import('@supabase/supabase-js')
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdyuqcxtdawxhhdxgkic.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )
      
      const { data } = await supabase.auth.getUser(token)
      authUser = data?.user
    }
    
    if (!authUser || !authUser.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const { 
      name, 
      email, 
      emailChanged,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
    } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }
    
    try {
      // If email changed, update in Supabase Auth
      if (emailChanged && supabase) {
        const { error: authError } = await supabase.auth.updateUser({
          email: email,
        })
        
        if (authError) {
          return NextResponse.json(
            { error: 'Failed to update email: ' + authError.message },
            { status: 400 }
          )
        }
      }
      
      // Update user in database
      const updateData: any = {
        name: name.trim(),
        alias: name.trim(), // Also update alias to match
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
      }
      
      // Only update email in DB if it changed
      if (emailChanged) {
        updateData.email = email
      }
      
      const user = await prisma.user.update({
        where: { email: authUser.email },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          alias: true,
          shippingAddress: true,
          shippingCity: true,
          shippingState: true,
          shippingZip: true,
        },
      })
      
      return NextResponse.json({ success: true, user })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      // Handle unique constraint violation
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

