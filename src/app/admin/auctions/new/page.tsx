'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { generateUniqueSlug } from '@/lib/helpers'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewAuctionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [published, setPublished] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string)?.trim() ?? ''
    const description = (fd.get('description') as string)?.trim() ?? ''
    const startDate = (fd.get('startDate') as string) ?? ''
    const startTime = (fd.get('startTime') as string) ?? ''
    const endDate = (fd.get('endDate') as string) ?? ''
    const endTime = (fd.get('endTime') as string) ?? ''

    const missing: string[] = []
    if (!name) missing.push('Name')
    if (!startDate) missing.push('Start Date')
    if (!startTime) missing.push('Start Time')
    if (!endDate) missing.push('End Date')
    if (!endTime) missing.push('End Time')

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return
    }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error('Invalid date or time values')
      return
    }
    if (end <= start) {
      toast.error('End date/time must be after start date/time')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          slug: generateUniqueSlug(name),
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          published,
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

  const inputClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/auctions">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Auction</h1>
          <p className="text-sm text-muted-foreground">Create your monthly ceramic drop</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="font-semibold mb-4">Auction Details</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="February Collection 2025"
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="A collection of handcrafted ceramic mugs..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            />
          </div>

          {/* Start */}
          <div className="space-y-2">
            <Label>Start Date & Time *</Label>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="startDate"
                type="date"
                className={inputClass}
              />
              <input
                name="startTime"
                type="time"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-muted-foreground">First Saturday, 8pm recommended</p>
          </div>

          {/* End */}
          <div className="space-y-2">
            <Label>End Date & Time *</Label>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="endDate"
                type="date"
                className={inputClass}
              />
              <input
                name="endTime"
                type="time"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-muted-foreground">3 days after start</p>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <Label>Published</Label>
              <p className="text-xs text-muted-foreground">Make visible on site</p>
            </div>
            <Switch
              checked={published}
              onCheckedChange={setPublished}
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
              type="submit"
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
              type="button"
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
        </form>
      </Card>
    </div>
  )
}
