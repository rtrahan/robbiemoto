import { NextResponse } from 'next/server'

// Inngest webhook endpoint
// Enable this when you set up Inngest for background jobs
// For now, returns 503 to pass builds

export async function GET() {
  return NextResponse.json(
    { error: 'Inngest not configured. Set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY to enable.' },
    { status: 503 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Inngest not configured' },
    { status: 503 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Inngest not configured' },
    { status: 503 }
  )
}
