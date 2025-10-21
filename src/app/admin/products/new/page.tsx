'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2, Upload, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
  
  // Product characteristics selected
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([])
  
  // Variants for each characteristic
  // Each variant has: name, description, imageUrl
  const [characteristicVariants, setCharacteristicVariants] = useState<Record<string, Array<{
    name: string
    description: string
    imageUrl: string
  }>>>({
    Leather: [],
    Fur: [],
    Fabric: [],
  })
  
  // Customization state
  const [customization, setCustomization] = useState({
    monogramEnabled: false,
    monogramTypes: ['initials', 'date'] as string[],
  })

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
          imageUrl: mediaUrls[0], // Send first image
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // AI can return both title and description
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
      // Build variants structure with only selected characteristics
      const variantsData: Record<string, any> = {}
      selectedCharacteristics.forEach(char => {
        if (characteristicVariants[char]?.length > 0) {
          variantsData[char] = characteristicVariants[char]
        }
      })
      
      const hasAnyVariants = Object.keys(variantsData).length > 0
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          mediaUrls,
          variants: hasAnyVariants ? variantsData : null,
          customizationOptions: customization.monogramEnabled ? customization : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      toast.success('Product created!')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Product creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Product</h1>
          <p className="text-sm text-muted-foreground">Add a product to your shop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Images - Compact */}
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
                      
                      // Check file sizes before uploading
                      const MAX_SIZE = 50 * 1024 * 1024 // 50MB limit
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

            {/* Product Characteristics & Variants */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Product Characteristics & Variants (Optional)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select what materials this product has, then add variants (with images) for each.
              </p>
              
              {/* Select Characteristics */}
              <div className="mb-6">
                <Label className="mb-2">Product Characteristics</Label>
                <div className="flex gap-4 flex-wrap">
                  {['Leather', 'Fur', 'Fabric'].map((char) => (
                    <label key={char} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCharacteristics.includes(char)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCharacteristics([...selectedCharacteristics, char])
                          } else {
                            setSelectedCharacteristics(selectedCharacteristics.filter(c => c !== char))
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">{char}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Variants for each selected characteristic */}
              {selectedCharacteristics.length > 0 && (
                <div className="space-y-6">
                  {selectedCharacteristics.map((characteristic) => (
                    <div key={characteristic} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{characteristic} Variants</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCharacteristicVariants({
                              ...characteristicVariants,
                              [characteristic]: [
                                ...(characteristicVariants[characteristic] || []),
                                { name: '', description: '', imageUrl: '' }
                              ]
                            })
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {characteristic} Variant
                        </Button>
                      </div>

                      {characteristicVariants[characteristic]?.length > 0 && (
                        <div className="space-y-4">
                          {characteristicVariants[characteristic].map((variant, variantIndex) => (
                            <div key={variantIndex} className="border rounded p-3 bg-gray-50 space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder={`Name (e.g., Cognac Brown, White Fur)`}
                                    value={variant.name}
                                    onChange={(e) => {
                                      const newVariants = [...characteristicVariants[characteristic]]
                                      newVariants[variantIndex].name = e.target.value
                                      setCharacteristicVariants({ ...characteristicVariants, [characteristic]: newVariants })
                                    }}
                                  />
                                  <Input
                                    placeholder="Description (optional)"
                                    value={variant.description}
                                    onChange={(e) => {
                                      const newVariants = [...characteristicVariants[characteristic]]
                                      newVariants[variantIndex].description = e.target.value
                                      setCharacteristicVariants({ ...characteristicVariants, [characteristic]: newVariants })
                                    }}
                                  />
                                  {variant.imageUrl && (
                                    <div className="relative w-20 h-20 rounded overflow-hidden">
                                      <img src={variant.imageUrl} className="w-full h-full object-cover" alt={variant.name} />
                                    </div>
                                  )}
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        
                                        const uploadingToast = toast.loading('Uploading variant image...')
                                        
                                        try {
                                          const { createClient } = await import('@supabase/supabase-js')
                                          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
                                          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                                          const supabase = createClient(supabaseUrl, supabaseKey)
                                          
                                          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
                                          const sanitizedExt = fileExt.replace(/[^a-z0-9]/g, '')
                                          const timestamp = Date.now()
                                          const randomStr = Math.random().toString(36).substring(2, 11)
                                          const fileName = `img-${timestamp}-${randomStr}.${sanitizedExt}`
                                          
                                          const { error } = await supabase.storage
                                            .from('product-media')
                                            .upload(fileName, file, {
                                              cacheControl: '3600',
                                              upsert: false
                                            })
                                          
                                          if (error) throw error
                                          
                                          const { data: { publicUrl } } = supabase.storage
                                            .from('product-media')
                                            .getPublicUrl(fileName)
                                          
                                          const newVariants = [...characteristicVariants[characteristic]]
                                          newVariants[variantIndex].imageUrl = publicUrl
                                          setCharacteristicVariants({ ...characteristicVariants, [characteristic]: newVariants })
                                          
                                          toast.success('Image uploaded!', { id: uploadingToast })
                                          e.target.value = ''
                                        } catch (error) {
                                          console.error('Upload error:', error)
                                          toast.error('Upload failed', { id: uploadingToast })
                                        }
                                      }}
                                      style={{ display: 'none' }}
                                    />
                                    <Button type="button" variant="outline" size="sm" asChild>
                                      <span>
                                        <Upload className="h-3 w-3 mr-2" />
                                        {variant.imageUrl ? 'Change Image' : 'Upload Image'}
                                      </span>
                                    </Button>
                                  </label>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newVariants = characteristicVariants[characteristic].filter((_, i) => i !== variantIndex)
                                    setCharacteristicVariants({ ...characteristicVariants, [characteristic]: newVariants })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {characteristicVariants[characteristic]?.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No {characteristic.toLowerCase()} variants yet. Click "Add {characteristic} Variant" above.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Customization Options */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Customization Options</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customization.monogramEnabled}
                    onChange={(e) => setCustomization({ ...customization, monogramEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Offer Monogram/Personalization</span>
                </label>
                
                {customization.monogramEnabled && (
                  <div className="pl-6 space-y-2">
                    <p className="text-xs text-muted-foreground">Customers can choose:</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customization.monogramTypes.includes('initials')}
                          onChange={(e) => {
                            const types = e.target.checked 
                              ? [...customization.monogramTypes, 'initials']
                              : customization.monogramTypes.filter(t => t !== 'initials')
                            setCustomization({ ...customization, monogramTypes: types })
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Initials</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customization.monogramTypes.includes('date')}
                          onChange={(e) => {
                            const types = e.target.checked 
                              ? [...customization.monogramTypes, 'date']
                              : customization.monogramTypes.filter(t => t !== 'date')
                            setCustomization({ ...customization, monogramTypes: types })
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">Date</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
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
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="LEATHER_GOODS">Leather Goods</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={(formData.priceCents / 100).toFixed(2)}
                        onChange={(e) => setFormData({ ...formData, priceCents: Math.round(parseFloat(e.target.value) * 100) })}
                        className="pl-7"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Compare At Price (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={formData.compareAtCents ? (formData.compareAtCents / 100).toFixed(2) : ''}
                        onChange={(e) => setFormData({ ...formData, compareAtCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0 })}
                        className="pl-7"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Show sale price</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="trackInventory"
                      checked={formData.trackInventory}
                      onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                      className="mr-2"
                    />
                    <Label htmlFor="trackInventory" className="cursor-pointer">
                      Track inventory
                    </Label>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Status</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Visibility</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SOLD_OUT">Sold Out</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured product
                  </Label>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
              
              <Link href="/admin/products" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

