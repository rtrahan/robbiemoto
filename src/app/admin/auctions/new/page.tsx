'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { generateUniqueSlug } from '@/lib/helpers'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewAuctionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startsAt: '',
    endsAt: '',
    published: false,
  })
  
  const handleSubmit = async () => {
    if (!formData.name || !formData.startsAt || !formData.endsAt) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: generateUniqueSlug(formData.name),
          startsAt: new Date(formData.startsAt).toISOString(),
          endsAt: new Date(formData.endsAt).toISOString(),
          softCloseWindowSec: 120,
          softCloseExtendSec: 120,
          fixedIncrementCents: 500,
          featured: false,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create auction')
      }
      
      const auction = await response.json()
      toast.success('Auction created! Now add items.')
      router.push(`/admin/auctions/${auction.id}/edit`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="max-w-2xl">
      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/auctions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Auction</h1>
          <p className="text-sm text-muted-foreground">Create your monthly ceramic drop</p>
        </div>
      </div>

      {/* Simple Card Form */}
      <Card className="p-6">
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold mb-4">Auction Details</h2>
          </div>

          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="February Collection 2025"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A collection of handcrafted ceramic mugs..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date & Time *</Label>
              <Input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">First Saturday, 8pm recommended</p>
            </div>

            <div className="space-y-2">
              <Label>End Date & Time *</Label>
              <Input
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">3 days after start</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <Label>Published</Label>
              <p className="text-xs text-muted-foreground">Make visible on site</p>
            </div>
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
          </div>

          <div className="border-t pt-4 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-gray-700 mb-1">Default Settings:</p>
            <p>• Bid Increment: $5</p>
            <p>• Soft Close: 2 min window</p>
            <p>• Extension: 2 min</p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Create & Add Items</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/auctions')}
            >
              Cancel
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">💡 Next Steps</p>
            <p className="text-xs text-blue-700">
              After creating the auction, you'll add ~12 ceramic items with photos to this drop.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
