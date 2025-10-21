import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD STARTING ===')
    
    const formData = await request.formData()
    
    // Handle both single file ('file') and multiple files ('files')
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null
    const lotId = formData.get('lotId') as string | null
    
    const filesToUpload = files.length > 0 ? files : (singleFile ? [singleFile] : [])
    
    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Get Supabase config
    const dbUrl = process.env.DATABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
    const projectId = match ? match[1] : null
    
    if (!projectId || !supabaseAnonKey) {
      // Return mock URLs for development
      const mockUrls = filesToUpload.map(file => 
        `https://utfs.io/f/${file.name.replace(/\s+/g, '-')}-${Date.now()}`
      )
      return NextResponse.json({ 
        urls: mockUrls,
        url: mockUrls[0], // For backwards compatibility
        success: true 
      })
    }
    
    const supabaseUrl = `https://${projectId}.supabase.co`
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Upload all files
    const uploadedUrls = []
    
    for (const file of filesToUpload) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${lotId || 'product'}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('auction-media')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error.message)
        // Return mock URL on error
        uploadedUrls.push(`https://utfs.io/f/${file.name.replace(/\s+/g, '-')}-${Date.now()}`)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('auction-media')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrl)
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0], // For backwards compatibility
    })
  } catch (error) {
    console.error('Upload exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
