'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'CERAMICS',
    priceCents: 3500,
    compareAtCents: 0,
    stockQuantity: 1,
    trackInventory: true,
    featured: false,
    status: 'ACTIVE',
  })
  const [mediaUrls, setMediaUrls] = useState<string[]>([])

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`)
      if (response.ok) {
        const product = await response.json()
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || 'CERAMICS',
          priceCents: product.priceCents || 3500,
          compareAtCents: product.compareAtCents || 0,
          stockQuantity: product.stockQuantity || 1,
          trackInventory: product.trackInventory ?? true,
          featured: product.featured || false,
          status: product.status || 'ACTIVE',
        })
        setMediaUrls(product.mediaUrls || [])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setIsFetching(false)
    }
  }

  const generateDescription = async () => {
    if (mediaUrls.length === 0) {
      toast.error('Upload at least one image first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.name || 'Leather product',
          type: 'product',
          category: formData.category,
          imageUrl: mediaUrls[0],
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setFormData({ 
          ...formData, 
          name: result.title || formData.name,
          description: result.description 
        })
        toast.success('Generated!')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate')
      }
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Could not generate description')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Product name is required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          ...formData,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          mediaUrls,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product')
      }

      toast.success('Product updated!')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Update product details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Product Images</h2>
                <p className="text-xs text-muted-foreground">Upload photos, then AI will help</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return
                    
                    const MAX_SIZE = 50 * 1024 * 1024
                    const tooLarge = files.filter(f => f.size > MAX_SIZE)
                    if (tooLarge.length > 0) {
                      toast.error('File too large', {
                        description: `${tooLarge.map(f => f.name).join(', ')} is ${(tooLarge[0].size / 1024 / 1024).toFixed(1)}MB. Maximum is 50MB. Please compress your video first.`
                      })
                      e.target.value = ''
                      return
                    }
                    
                    const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`)
                    
                    try {
                      // Import Supabase client for direct browser upload (bypasses Vercel)
                      const { createClient } = await import('@supabase/supabase-js')
                      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                      const supabase = createClient(supabaseUrl, supabaseKey)
                      
                      const uploadPromises = files.map(async (file) => {
                        // Sanitize filename for Supabase
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
                        const sanitizedExt = fileExt.replace(/[^a-z0-9]/g, '')
                        const timestamp = Date.now()
                        const randomStr = Math.random().toString(36).substring(2, 11)
                        const isVideo = file.type.startsWith('video/')
                        const prefix = isVideo ? 'vid' : 'img'
                        const fileName = `${prefix}-${timestamp}-${randomStr}.${sanitizedExt}`
                        
                        console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) directly to Supabase...`)
                        
                        // Direct upload to Supabase Storage (no Vercel limits!)
                        const { data, error } = await supabase.storage
                          .from('product-media')
                          .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                          })
                        
                        if (error) {
                          console.error('Supabase upload error:', error)
                          throw new Error(`Upload failed: ${error.message}`)
                        }
                        
                        // Get public URL
                        const { data: { publicUrl } } = supabase.storage
                          .from('product-media')
                          .getPublicUrl(fileName)
                        
                        console.log(`✅ Uploaded successfully: ${publicUrl}`)
                        return publicUrl
                      })
                      
                      const urls = await Promise.all(uploadPromises)
                      
                      setMediaUrls([...mediaUrls, ...urls])
                      toast.success(`Uploaded ${urls.length} file(s)!`, {
                        id: uploadingToast,
                      })
                      e.target.value = ''
                    } catch (error) {
                      console.error('Upload error:', error)
                      toast.error('Upload failed', {
                        id: uploadingToast,
                        description: error instanceof Error ? error.message : 'Unknown error'
                      })
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>
            
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {mediaUrls.map((url, index) => {
                  const isVideo = url.includes('vid-') || url.match(/\.(mp4|mov|webm|ogg)$/i)
                  return (
                    <div key={index} className="relative bg-gray-100 rounded overflow-hidden group" style={{ aspectRatio: '4/3' }}>
                      {isVideo ? (
                        <video src={url} className="w-full h-full object-contain" controls />
                      ) : (
                        <img src={url} alt={`${index + 1}`} className="w-full h-full object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Product Details</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGenerating || mediaUrls.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-2" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Handcrafted Leather Wallet"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload images first, then click AI Generate above
                </p>
              </div>

              <div>
                <Label>Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="CERAMICS">Ceramics</option>
                  <option value="LEATHER">Leather</option>
                  <option value="ACCESSORIES">Accessories</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={(formData.priceCents / 100).toFixed(2)}
                      onChange={(e) => setFormData({ ...formData, priceCents: Math.round(parseFloat(e.target.value) * 100) })}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Compare At Price (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={(formData.compareAtCents / 100).toFixed(2)}
                      onChange={(e) => setFormData({ ...formData, compareAtCents: Math.round(parseFloat(e.target.value) * 100) })}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Show sale price</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trackInventory}
                    onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Track inventory</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

