import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD STARTING ===')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const lotId = formData.get('lotId') as string
    
    console.log('File received:', file?.name, 'Size:', file?.size, 'Type:', file?.type)
    console.log('Lot ID:', lotId)
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get Supabase config
    const dbUrl = process.env.DATABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('DATABASE_URL exists:', !!dbUrl)
    console.log('ANON_KEY exists:', !!supabaseAnonKey)
    
    const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
    const projectId = match ? match[1] : null
    
    console.log('Project ID:', projectId)
    
    if (!projectId || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Supabase not configured properly',
        projectId: !!projectId,
        anonKey: !!supabaseAnonKey
      }, { status: 500 })
    }
    
    const supabaseUrl = `https://${projectId}.supabase.co`
    console.log('Supabase URL:', supabaseUrl)
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    // Upload file
    const fileExt = file.name.split('.').pop()
    const fileName = `${lotId}/${Date.now()}.${fileExt}`
    
    console.log('Uploading to:', fileName)
    
    const { data, error } = await supabase.storage
      .from('auction-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('=== UPLOAD ERROR ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
      
      return NextResponse.json({ 
        error: 'Upload failed: ' + error.message,
        hint: 'Check Supabase Storage policies - need INSERT permission'
      }, { status: 500 })
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('auction-media')
      .getPublicUrl(fileName)

    console.log('Public URL:', publicUrl)
    console.log('=== UPLOAD COMPLETE ===')

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
    })
  } catch (error) {
    console.error('=== UPLOAD EXCEPTION ===')
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
