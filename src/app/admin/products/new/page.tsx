'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2, Upload } from 'lucide-react'
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

  const generateDescription = async () => {
    if (!formData.name) {
      toast.error('Enter a product name first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: 'product',
        }),
      })

      if (response.ok) {
        const { description } = await response.json()
        setFormData({ ...formData, description })
        toast.success('Description generated!')
      } else {
        throw new Error('Failed to generate')
      }
    } catch (error) {
      toast.error('Could not generate description')
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
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      toast.success('Product created!')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error('Failed to create product')
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
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Product Details</h2>
              
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
                  <div className="flex items-center justify-between mb-2">
                    <Label>Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={isGenerating || !formData.name}
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
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Click AI Generate to create a description automatically
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

            {/* Images */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Product Images</h2>
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Upload product photos</p>
                <p className="text-xs text-gray-400">Coming soon - for now, add image URLs after creation</p>
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

