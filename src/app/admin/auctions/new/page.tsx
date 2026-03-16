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

function parseDateInput(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null

  const dateParts = dateStr.match(/^(\d{1,2})\/?(\d{1,2})\/?(\d{4})$/)
  if (!dateParts) return null

  const month = parseInt(dateParts[1], 10)
  const day = parseInt(dateParts[2], 10)
  const year = parseInt(dateParts[3], 10)

  const timeParts = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i)
  if (!timeParts) return null

  let hours = parseInt(timeParts[1], 10)
  const minutes = parseInt(timeParts[2], 10)
  const ampm = timeParts[3]?.toLowerCase()

  if (ampm === 'pm' && hours < 12) hours += 12
  if (ampm === 'am' && hours === 12) hours = 0

  const d = new Date(year, month - 1, day, hours, minutes)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export default function NewAuctionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [published, setPublished] = useState(false)

  const startDateRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    const name = nameRef.current?.value?.trim() ?? ''
    const description = descRef.current?.value?.trim() ?? ''
    const startDateVal = startDateRef.current?.value?.trim() ?? ''
    const startTimeVal = startTimeRef.current?.value?.trim() ?? ''
    const endDateVal = endDateRef.current?.value?.trim() ?? ''
    const endTimeVal = endTimeRef.current?.value?.trim() ?? ''

    const missing: string[] = []
    if (!name) missing.push('Name')
    if (!startDateVal) missing.push('Start Date')
    if (!startTimeVal) missing.push('Start Time')
    if (!endDateVal) missing.push('End Date')
    if (!endTimeVal) missing.push('End Time')

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return
    }

    const start = parseDateInput(startDateVal, startTimeVal)
    const end = parseDateInput(endDateVal, endTimeVal)

    if (!start) {
      toast.error('Could not parse start date/time. Use MM/DD/YYYY and HH:MM AM/PM.')
      return
    }
    if (!end) {
      toast.error('Could not parse end date/time. Use MM/DD/YYYY and HH:MM AM/PM.')
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

  const inputClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm'

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
          <div>
            <h2 className="font-semibold mb-4">Auction Details</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <input
              ref={nameRef}
              id="name"
              type="text"
              placeholder="February Collection 2025"
              autoFocus
              className={inputClass}
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

          <div className="space-y-2">
            <Label>Start Date & Time *</Label>
            <div className="grid grid-cols-2 gap-2">
              <input
                ref={startDateRef}
                type="text"
                placeholder="MM/DD/YYYY"
                className={inputClass}
              />
              <input
                ref={startTimeRef}
                type="text"
                placeholder="8:00 PM"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-muted-foreground">First Saturday, 8pm recommended</p>
          </div>

          <div className="space-y-2">
            <Label>End Date & Time *</Label>
            <div className="grid grid-cols-2 gap-2">
              <input
                ref={endDateRef}
                type="text"
                placeholder="MM/DD/YYYY"
                className={inputClass}
              />
              <input
                ref={endTimeRef}
                type="text"
                placeholder="8:00 PM"
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
              type="button"
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
        </div>
      </Card>
    </div>
  )
}
