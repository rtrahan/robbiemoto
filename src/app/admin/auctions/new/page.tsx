'use client'

import { useRef, useState } from 'react'
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

  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const lastStart = useRef('')
  const lastEnd = useRef('')

  const captureStart = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value
    if (val) lastStart.current = val
  }
  const captureEnd = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value
    if (val) lastEnd.current = val
  }

  const handleSubmit = async () => {
    const name = nameRef.current?.value?.trim() ?? ''
    const description = descRef.current?.value?.trim() ?? ''
    const startsAtRaw = lastStart.current
    const endsAtRaw = lastEnd.current

    const missing: string[] = []
    if (!name) missing.push('Name')
    if (!startsAtRaw) missing.push('Start Date & Time')
    if (!endsAtRaw) missing.push('End Date & Time')

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return
    }

    const start = new Date(startsAtRaw)
    const end = new Date(endsAtRaw)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error('Invalid date values')
      return
    }
    if (end <= start) {
      toast.error('End must be after start')
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
        <div className="space-y-5">
          <h2 className="font-semibold mb-4">Auction Details</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <input
              ref={nameRef}
              id="name"
              type="text"
              placeholder="February Collection 2025"
              autoFocus
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              ref={descRef}
              id="description"
              placeholder="A collection of handcrafted ceramic mugs..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start *</Label>
              <input
                type="datetime-local"
                onChange={captureStart}
                onInput={captureStart}
                onBlur={captureStart}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>End *</Label>
              <input
                type="datetime-local"
                onChange={captureEnd}
                onInput={captureEnd}
                onBlur={captureEnd}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <Label>Published</Label>
              <p className="text-xs text-muted-foreground">Make visible on site</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>

          <div className="border-t pt-4 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-gray-700 mb-1">Default Settings:</p>
            <p>• Bid Increment: $5</p>
            <p>• Soft Close: 2 min window</p>
            <p>• Extension: 2 min</p>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Create & Add Items</>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/auctions')}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
