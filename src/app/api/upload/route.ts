import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD STARTING ===')
    
    const formData = await request.formData()
    
    // Debug: log all form data keys
    const keys = Array.from(formData.keys())
    console.log('FormData keys:', keys)
    
    // Handle both single file ('file') and multiple files ('files')
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null
    const lotId = formData.get('lotId') as string | null
    
    console.log('Files array length:', files.length)
    console.log('Single file:', singleFile?.name)
    
    const filesToUpload = files.length > 0 ? files : (singleFile ? [singleFile] : [])
    
    console.log('Files to upload:', filesToUpload.length)
    
    if (filesToUpload.length === 0) {
      console.error('No files found in FormData')
      return NextResponse.json({ 
        error: 'No files provided',
        keysReceived: keys,
      }, { status: 400 })
    }

    // Get Supabase config - use direct URL if DATABASE_URL not available
    const dbUrl = process.env.DATABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    console.log('Config check:', {
      hasDatabaseUrl: !!dbUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasSupabaseUrl: !!supabaseUrl,
    })
    
    // Try to get project ID from DATABASE_URL or use direct URL
    const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
    const projectId = match ? match[1] : (supabaseUrl ? supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] : null)
    
    if (!supabaseAnonKey) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
      return NextResponse.json({ 
        error: 'Supabase not configured - missing ANON_KEY',
        hint: 'Add NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables',
      }, { status: 500 })
    }
    
    if (!projectId && !supabaseUrl) {
      console.error('❌ Cannot determine Supabase URL!')
      return NextResponse.json({ 
        error: 'Supabase not configured - missing URL',
        hint: 'Add NEXT_PUBLIC_SUPABASE_URL to Vercel environment variables',
      }, { status: 500 })
    }
    
    const finalSupabaseUrl = supabaseUrl || `https://${projectId}.supabase.co`
    console.log('Using Supabase URL:', finalSupabaseUrl)
    
    const supabase = createClient(finalSupabaseUrl, supabaseAnonKey)

    // Determine which bucket to use
    const bucketName = lotId ? 'auction-media' : 'product-media'
    console.log('Using bucket:', bucketName)
    
    // Upload all files
    const uploadedUrls = []
    
    for (const file of filesToUpload) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      
      console.log('Uploading to bucket:', bucketName, 'File:', fileName)
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ SUPABASE UPLOAD ERROR:', {
          message: error.message,
          name: error.name,
          bucket: bucketName,
          file: fileName,
        })
        
        // Don't fail silently - throw the error
        return NextResponse.json({
          error: `Upload failed: ${error.message}`,
          hint: 'Check Supabase Storage policies for ' + bucketName,
          bucket: bucketName,
        }, { status: 500 })
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)
      
      console.log('✅ Upload successful, URL:', publicUrl)
      uploadedUrls.push(publicUrl)
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
