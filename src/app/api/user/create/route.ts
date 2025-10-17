import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, supabaseId } = await request.json()
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: supabaseId,
        email,
        name,
        alias: name, // Use their actual name as alias
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

