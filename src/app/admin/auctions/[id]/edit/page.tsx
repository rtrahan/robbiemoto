'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Trash2, Plus, X, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EditAuctionPage() {
  const router = useRouter()
  const params = useParams()
  const auctionId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [lots, setLots] = useState<any[]>([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingLot, setEditingLot] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startsAt: '',
    endsAt: '',
    published: false,
  })
  const [newLot, setNewLot] = useState({
    title: '',
    description: '',
    condition: 'New - Handmade',
    startingBidCents: 3500,
    reserveCents: 8000,
  })
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [editingFiles, setEditingFiles] = useState<any[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isGeneratingAuctionAI, setIsGeneratingAuctionAI] = useState(false)
  const [showBidsModal, setShowBidsModal] = useState(false)
  const [selectedLotForBids, setSelectedLotForBids] = useState<any>(null)
  const [lotBids, setLotBids] = useState<any[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionRes, lotsRes] = await Promise.all([
          fetch(`/api/admin/auctions/${auctionId}`),
          fetch(`/api/admin/auctions/${auctionId}/lots`) // Use admin endpoint for all lots
        ])
        
        if (auctionRes.ok) {
          const auction = await auctionRes.json()
          
          // Convert UTC dates to local datetime-local format
          const startDate = new Date(auction.startsAt)
          const endDate = new Date(auction.endsAt)
          
          // Format for datetime-local: YYYY-MM-DDTHH:MM (in local timezone)
          const formatForInput = (date: Date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
          }
          
          setFormData({
            name: auction.name,
            description: auction.description || '',
            startsAt: formatForInput(startDate),
            endsAt: formatForInput(endDate),
            published: auction.published,
          })
        }
        
        if (lotsRes.ok) {
          const lotsData = await lotsRes.json()
          setLots(lotsData)
        }
      } catch (error) {
        toast.error('Failed to load')
      } finally {
        setIsFetching(false)
      }
    }
    
    fetchData()
  }, [auctionId])
  
  const handleSubmit = async () => {
    if (!formData.startsAt || !formData.endsAt) {
      toast.error('Start and end dates are required')
      return
    }
    
    setIsLoading(true)
    
    try {
      // datetime-local gives us "2025-10-20T18:00" with NO timezone
      // We need to append timezone offset to make it local time
      // Then convert to UTC for storage
      
      const response = await fetch(`/api/admin/auctions/${auctionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          startsAt: formData.startsAt, // Send raw - backend will handle properly
          endsAt: formData.endsAt, // Send raw - backend will handle properly  
          published: formData.published,
          softCloseWindowSec: 120,
          softCloseExtendSec: 120,
          fixedIncrementCents: 500,
          featured: false,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save')
      }
      
      toast.success('Auction saved!')
      
      // Refresh the page to show updated dates
      window.location.reload()
    } catch (error) {
      toast.error('Failed to save auction')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAddLot = async () => {
    if (!newLot.title) {
      toast.error('Enter a title')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLot,
          auctionId,
          slug: newLot.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          mediaUrls: uploadedFiles.map(f => f.url), // Send uploaded URLs
        }),
      })
      
      if (!response.ok) throw new Error()
      
      const lot = await response.json()
      
      // Add media URLs to the lot object for immediate display
      lot.mediaUrls = uploadedFiles.map(f => f.url)
      
      setLots([...lots, lot])
      setNewLot({
        title: '',
        description: '',
        condition: 'New - Handmade',
        startingBidCents: 3500,
        reserveCents: 8000,
      })
      setUploadedFiles([])
      setShowItemModal(false)
      toast.success('Added with photo!')
    } catch (error) {
      toast.error('Failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteLot = async (lotId: string) => {
    if (!confirm('Delete?')) return
    
    try {
      await fetch(`/api/admin/lots/${lotId}`, { method: 'DELETE' })
      setLots(lots.filter(lot => lot.id !== lotId))
      toast.success('Deleted!')
    } catch (error) {
      toast.error('Failed')
    }
  }
  
  const handleViewBids = async (e: React.MouseEvent, lot: any) => {
    e.stopPropagation()
    
    setSelectedLotForBids(lot)
    setShowBidsModal(true)
    setLoadingBids(true)
    
    // Fetch bid history
    try {
      const response = await fetch(`/api/lots/${lot.id}/bids`)
      if (response.ok) {
        const bids = await response.json()
        setLotBids(bids)
      } else {
        toast.error('Failed to load bids')
        setLotBids([])
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
      toast.error('Failed to load bids')
      setLotBids([])
    } finally {
      setLoadingBids(false)
    }
  }
  
  const handleEditLot = (lot: any) => {
    setEditingLot(lot.id)
    setEditFormData({
      title: lot.title,
      description: lot.description || '',
      condition: lot.condition,
      startingBidCents: lot.startingBidCents,
      reserveCents: lot.reserveCents,
      mediaUrls: lot.mediaUrls || [],
    })
    setEditingFiles([])
    setShowItemModal(true)
  }
  
  const handleNewLot = () => {
    setEditingLot(null)
    setNewLot({
      title: '',
      description: '',
      condition: 'New - Handmade',
      startingBidCents: 3500,
      reserveCents: 8000,
    })
    setUploadedFiles([])
    setShowItemModal(true)
  }
  
  const handleCloseModal = () => {
    setShowItemModal(false)
    setEditingLot(null)
    setUploadedFiles([])
    setEditingFiles([])
  }
  
  const handleGenerateAuctionDescription = async () => {
    if (lots.length === 0) {
      toast.error('Add some items first!')
      return
    }
    
    setIsGeneratingAuctionAI(true)
    const generatingToast = toast.loading('AI analyzing your collection...')
    
    try {
      const response = await fetch('/api/ai/generate-auction-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: lots.map(lot => ({
            title: lot.title,
            description: lot.description
          }))
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed')
      }
      
      setFormData({
        ...formData,
        description: result.description
      })
      
      toast.success('Auction description generated! ✨', { id: generatingToast })
    } catch (error: any) {
      toast.error(error.message || 'AI generation failed', { id: generatingToast })
    } finally {
      setIsGeneratingAuctionAI(false)
    }
  }
  
  const handleGenerateWithAI = async () => {
    const files = editingLot ? editingFiles : uploadedFiles
    
    if (files.length === 0) {
      toast.error('Upload an image first!')
      return
    }
    
    // Find first image that's not HEIC (OpenAI doesn't support HEIC)
    const supportedImage = files.find(f => 
      f.type === 'image' && 
      f.url && 
      !f.url.toLowerCase().endsWith('.heic')
    )
    
    if (!supportedImage) {
      toast.error('Please upload a JPEG, PNG, GIF, or WEBP image (not HEIC)')
      return
    }
    
    setIsGeneratingAI(true)
    const generatingToast = toast.loading('AI analyzing your mug photo...')
    
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: supportedImage.url }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('AI Error:', result)
        throw new Error(result.error || 'Failed to generate')
      }
      
      if (editingLot) {
        setEditFormData({
          ...editFormData,
          title: result.title,
          description: result.description,
          condition: result.condition || 'New - Handmade',
        })
      } else {
        setNewLot({
          ...newLot,
          title: result.title,
          description: result.description,
          condition: result.condition || 'New - Handmade',
        })
      }
      
      toast.success('AI generated description! ✨', { id: generatingToast })
    } catch (error: any) {
      toast.error(error.message || 'AI generation failed', { id: generatingToast })
    } finally {
      setIsGeneratingAI(false)
    }
  }
  
  const handleUpdateLot = async (lotId: string) => {
    setIsLoading(true)
    
    try {
      // Combine existing URLs with newly uploaded ones
      const existingUrls = editFormData.mediaUrls || []
      const newUrls = editingFiles.map(f => f.url)
      const allMediaUrls = [...existingUrls, ...newUrls]
      
      const response = await fetch(`/api/admin/lots/${lotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          mediaUrls: allMediaUrls,
        }),
      })
      
      if (!response.ok) throw new Error()
      
      const updatedLot = await response.json()
      updatedLot.mediaUrls = allMediaUrls
      
      setLots(lots.map(lot => lot.id === lotId ? updatedLot : lot))
      setEditingLot(null)
      setEditingFiles([])
      setShowItemModal(false)
      toast.success('Updated!')
    } catch (error) {
      toast.error('Failed')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleImageUpload = async (lotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const uploadingToast = toast.loading(`Uploading ${files.length} file(s)...`)
    
    try {
      // Upload each file
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('lotId', lotId === 'new' ? 'temp' : lotId)
        
        console.log('Uploading file:', file.name, file.type, file.size)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        const result = await response.json()
        console.log('Upload response:', result)
        
        if (!response.ok) {
          throw new Error(result.error || result.details || `Failed to upload ${file.name}`)
        }
        
        return result
      })
      
      const results = await Promise.all(uploadPromises)
      
      // If uploading for new item, store temporarily
      if (lotId === 'new') {
        setUploadedFiles([...uploadedFiles, ...results])
      } else {
        setEditingFiles([...editingFiles, ...results])
      }
      
      toast.success(`Uploaded ${results.length} file(s)!`, {
        id: uploadingToast,
        description: results.map(r => r.fileName).join(', ')
      })
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        id: uploadingToast,
        description: error instanceof Error ? error.message : 'Unknown error - check console'
      })
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
    <div className="h-full flex flex-col">
      {/* Top Bar - Fixed */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-shrink-0">
        <Link href="/admin/auctions">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate">{formData.name || 'Edit Auction'}</h1>
          <p className="text-xs text-muted-foreground">{lots.length} items</p>
        </div>
      </div>

      {/* Responsive Layout: Stack on Mobile, Side-by-Side on Desktop */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:gap-6 overflow-hidden">
        {/* LEFT COLUMN - Auction Details - Fixed/Scrollable */}
        <div className="lg:overflow-y-auto lg:h-full space-y-4 lg:pr-2">
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Auction Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Spring Collection 2025"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Monthly ceramic drop..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                />
                <p className="text-xs text-blue-600">
                  Set in YOUR timezone - system handles the rest
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">End Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
                <p className="text-xs text-blue-600">
                  Users worldwide will see this in their local time
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-t">
                <div>
                  <Label className="text-xs">Published</Label>
                  <p className="text-[10px] text-muted-foreground">Make visible on site</p>
                </div>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
              </div>

              <div className="border-t pt-3 space-y-1 text-[11px] text-muted-foreground">
                <p className="font-medium text-gray-700 mb-1">Settings:</p>
                <p>• Bid Increment: $5</p>
                <p>• Soft Close: 2 min window</p>
                <p>• Extension: 2 min</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Auction'}
                </Button>

                <Button 
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    if (confirm('Delete entire auction and all items?')) {
                      await fetch(`/api/admin/auctions/${auctionId}`, { method: 'DELETE' })
                      toast.success('Deleted!')
                      router.push('/admin/auctions')
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Auction
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN - Items Grid - Scrollable */}
        <div className="flex flex-col lg:overflow-hidden lg:h-full">
          {/* Items Header - Fixed */}
          <div className="flex items-center justify-between mb-3 gap-2 flex-shrink-0">
            <h2 className="font-semibold text-sm sm:text-base">{lots.length} {lots.length === 1 ? 'Item' : 'Items'}</h2>
            <Button onClick={handleNewLot} size="sm" className="text-xs">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add Item
            </Button>
          </div>

          {/* Add Item Form - Removed, now using modal */}
          {false && (
            <Card className="p-6 mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
              <div className="flex items-start gap-6">
                {/* Left - Upload Area */}
                <div className="w-64 flex-shrink-0 space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleImageUpload('new', e)}
                      className="hidden"
                      multiple
                    />
                    <div className="aspect-square bg-white border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                      <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Upload Media</p>
                      <p className="text-xs text-blue-600">Click to select</p>
                      <p className="text-[10px] text-blue-500 mt-2">Images or Videos</p>
                      <p className="text-[10px] text-blue-400">(Up to 5 files)</p>
                    </div>
                  </label>
                  
                  {/* Show uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-700">✓ {uploadedFiles.length} uploaded:</p>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-1.5 rounded">
                          <span>{file.type === 'image' ? '🖼️' : '🎥'}</span>
                          <span className="truncate flex-1">{file.fileName}</span>
                          <button
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right - Item Details */}
                <div className="flex-1 space-y-3">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-blue-900">New Item Details</h3>
                    <p className="text-xs text-blue-600">Fill in the information below</p>
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Title *</Label>
                      <Input
                        value={newLot.title}
                        onChange={(e) => setNewLot({ ...newLot, title: e.target.value })}
                        placeholder="Sage Green Mug"
                        className="h-9 mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Condition</Label>
                      <Input
                        value={newLot.condition}
                        onChange={(e) => setNewLot({ ...newLot, condition: e.target.value })}
                        placeholder="New - Handmade"
                        className="h-9 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Description</Label>
                    <Textarea
                      value={newLot.description}
                      onChange={(e) => setNewLot({ ...newLot, description: e.target.value })}
                      placeholder="Beautiful hand-thrown ceramic mug with unique glaze..."
                      rows={3}
                      className="mt-1 resize-none"
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Starting Bid</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          step="5"
                          value={(newLot.startingBidCents / 100).toFixed(0)}
                          onChange={(e) => setNewLot({ ...newLot, startingBidCents: Math.round(parseFloat(e.target.value) * 100) })}
                          className="h-9 pl-6"
                          placeholder="35"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Recommended: $35</p>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-700">Reserve Price</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          step="5"
                          value={(newLot.reserveCents / 100).toFixed(0)}
                          onChange={(e) => setNewLot({ ...newLot, reserveCents: Math.round(parseFloat(e.target.value) * 100) })}
                          className="h-9 pl-6"
                          placeholder="80"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Hidden minimum price</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button onClick={handleAddLot} disabled={isLoading} className="flex-1 h-10">
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                      ) : (
                        <><Plus className="mr-2 h-4 w-4" /> Add to Auction</>
                      )}
                    </Button>
                    <Button onClick={handleCloseModal} variant="outline" className="h-10">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Items Grid - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {lots.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 pb-4 pr-1">
                {lots.map((lot, index) => (
                  <Card key={lot.id} className="group relative overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => handleEditLot(lot)}>
                    {false ? (
                      /* EDIT MODE */
                      <div className="space-y-3">
                        {/* Upload Area */}
                        <label className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center border-b-2 border-blue-200 relative cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-colors group/upload">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleImageUpload(lot.id, e)}
                            className="hidden"
                          />
                          <div className="absolute top-2 left-2 text-[10px] font-mono bg-white px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </div>
                          <div className="text-center">
                            <div className="text-4xl mb-1">📸</div>
                            <p className="text-[10px] text-blue-600 font-medium">Click to upload</p>
                            <p className="text-[9px] text-blue-500">image or video</p>
                          </div>
                        </label>
                        
                        <div className="p-3 space-y-2">
                          <div className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold mb-2">
                            Editing Item
                          </div>
                          
                          <div>
                            <Label className="text-[10px] text-gray-600">Title</Label>
                            <Input
                              value={editFormData.title}
                              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              placeholder="Sage Green Mug"
                              className="h-8 text-sm mt-0.5"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-[10px] text-gray-600">Description</Label>
                            <Textarea
                              value={editFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              placeholder="Beautiful hand-thrown..."
                              rows={2}
                              className="text-xs resize-none mt-0.5"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-[10px] text-gray-600">Condition</Label>
                            <Input
                              value={editFormData.condition}
                              onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                              className="h-8 text-xs mt-0.5"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px] text-gray-600">Start $</Label>
                              <Input
                                type="number"
                                step="5"
                                value={(editFormData.startingBidCents / 100).toFixed(0)}
                                onChange={(e) => setEditFormData({ ...editFormData, startingBidCents: Math.round(parseFloat(e.target.value) * 100) })}
                                className="h-8 text-xs mt-0.5"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-600">Reserve $</Label>
                              <Input
                                type="number"
                                step="5"
                                value={(editFormData.reserveCents / 100).toFixed(0)}
                                onChange={(e) => setEditFormData({ ...editFormData, reserveCents: Math.round(parseFloat(e.target.value) * 100) })}
                                className="h-8 text-xs mt-0.5"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button onClick={() => handleUpdateLot(lot.id)} disabled={isLoading} size="sm" className="flex-1 h-9">
                              <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                            </Button>
                            <Button onClick={() => setEditingLot(null)} size="sm" variant="outline" className="h-9">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE */
                      <>
                        {/* Delete Button - Hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLot(lot.id)
                          }}
                          className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          title="Delete item"
                        >
                          <X className="h-3.5 w-3.5 text-gray-600 hover:text-red-600" />
                        </button>

                        {/* Item Preview */}
                        <div className="aspect-square border-b relative overflow-hidden">
                          <div className="absolute top-2 left-2 text-[10px] font-mono bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm z-10">
                            #{index + 1}
                          </div>
                          
                          {/* Bid Count Badge */}
                          {lot._count?.bids > 0 && (
                            <button
                              onClick={(e) => handleViewBids(e, lot)}
                              className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-semibold shadow-md hover:bg-blue-700 transition-all z-10"
                              title="Click to view bid history"
                            >
                              🔨 {lot._count.bids} {lot._count.bids === 1 ? 'bid' : 'bids'}
                            </button>
                          )}
                          
                          {lot.mediaUrls && lot.mediaUrls.length > 0 ? (
                            <img 
                              src={lot.mediaUrls[0]} 
                              alt={lot.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                              <div className="text-5xl opacity-20">🏺</div>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="p-3 space-y-2">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                            {lot.title}
                          </h3>
                          
                          {lot.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {lot.description}
                            </p>
                          )}

                          <div className="pt-2 border-t space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Start</span>
                              <span className="font-medium">${(lot.startingBidCents / 100).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reserve</span>
                              <span className="font-medium">${(lot.reserveCents / 100).toFixed(0)}</span>
                            </div>
                            {lot.currentBidCents && (
                              <div className="flex justify-between text-green-600 font-semibold">
                                <span>Current</span>
                                <span>${(lot.currentBidCents / 100).toFixed(0)}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {lot.condition}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center border-2 border-dashed p-12">
                <div className="text-7xl opacity-10 mb-4">🏺</div>
                <p className="text-sm font-medium mb-1">No items yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Add ceramic pieces to this auction
                </p>
                <Button onClick={handleNewLot}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Item
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLot ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingLot ? 'Update the item details and photos' : 'Add a new ceramic piece to this auction'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Photos / Videos</Label>
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  variant="outline"
                  size="sm"
                  className="h-7"
                >
                  {isGeneratingAI ? (
                    <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Generating...</>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </Button>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleImageUpload(editingLot || 'new', e)}
                  className="hidden"
                  multiple
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <div className="text-5xl mb-2">📸</div>
                  <p className="text-sm font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-500">Images or videos (up to 5 files)</p>
                  <p className="text-xs text-blue-600 mt-1">✨ AI will describe your mug!</p>
                </div>
              </label>

              {/* Uploaded Files Preview */}
              {((editingLot ? (editingFiles.length > 0 || editFormData.mediaUrls?.length > 0) : uploadedFiles.length > 0)) && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-700 mb-2">
                    {editingLot 
                      ? `Photos (${(editFormData.mediaUrls?.length || 0) + editingFiles.length})`
                      : `✓ ${uploadedFiles.length} uploaded`
                    }
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Show existing photos for editing */}
                    {editingLot && editFormData.mediaUrls?.map((url: string, idx: number) => (
                      <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-blue-200">
                        <img 
                          src={url} 
                          alt="Existing photo"
                          className="w-full h-full object-cover"
                        />
                        {/* Reorder Arrows - Always visible for testing */}
                        <div className="absolute top-1 left-1 flex gap-1 z-20">
                          {idx > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const newUrls = [...editFormData.mediaUrls]
                                const temp = newUrls[idx]
                                newUrls[idx] = newUrls[idx - 1]
                                newUrls[idx - 1] = temp
                                setEditFormData({ ...editFormData, mediaUrls: newUrls })
                                toast.success('Moved left')
                              }}
                              className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 shadow-lg"
                              title="Move left"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {idx < editFormData.mediaUrls.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const newUrls = [...editFormData.mediaUrls]
                                const temp = newUrls[idx]
                                newUrls[idx] = newUrls[idx + 1]
                                newUrls[idx + 1] = temp
                                setEditFormData({ ...editFormData, mediaUrls: newUrls })
                                toast.success('Moved right')
                              }}
                              className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 shadow-lg"
                              title="Move right"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              const newUrls = [...editFormData.mediaUrls]
                              newUrls.splice(idx, 1)
                              setEditFormData({ ...editFormData, mediaUrls: newUrls })
                            }}
                            className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] px-1 py-0.5 flex items-center justify-between">
                          <span>#{idx + 1}</span>
                          <span>Existing</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show newly uploaded files */}
                    {(editingLot ? editingFiles : uploadedFiles).map((file, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-green-200">
                        {file.type === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={file.url}
                            className="w-full h-full object-cover"
                            controls
                            playsInline
                            muted
                          />
                        )}
                        {/* Reorder Arrows - Always visible */}
                        <div className="absolute top-1 left-1 flex gap-1 z-20">
                          {idx > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const files = editingLot ? [...editingFiles] : [...uploadedFiles]
                                const temp = files[idx]
                                files[idx] = files[idx - 1]
                                files[idx - 1] = temp
                                editingLot ? setEditingFiles(files) : setUploadedFiles(files)
                                toast.success('Moved left')
                              }}
                              className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 shadow-lg"
                              title="Move left"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          {idx < (editingLot ? editingFiles : uploadedFiles).length - 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const files = editingLot ? [...editingFiles] : [...uploadedFiles]
                                const temp = files[idx]
                                files[idx] = files[idx + 1]
                                files[idx + 1] = temp
                                editingLot ? setEditingFiles(files) : setUploadedFiles(files)
                                toast.success('Moved right')
                              }}
                              className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 shadow-lg"
                              title="Move right"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              if (editingLot) {
                                setEditingFiles(editingFiles.filter((_, i) => i !== idx))
                              } else {
                                setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
                              }
                            }}
                            className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[9px] px-1 py-0.5 flex items-center justify-between">
                          <span>#{(editFormData.mediaUrls?.length || 0) + idx + 1}</span>
                          <span className="truncate flex-1 ml-1">{file.fileName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Item Form */}
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-sm">Title *</Label>
                <Input
                  value={editingLot ? editFormData.title : newLot.title}
                  onChange={(e) => editingLot 
                    ? setEditFormData({ ...editFormData, title: e.target.value })
                    : setNewLot({ ...newLot, title: e.target.value })
                  }
                  placeholder="Sage Green Mug"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Condition</Label>
                <Input
                  value={editingLot ? editFormData.condition : newLot.condition}
                  onChange={(e) => editingLot
                    ? setEditFormData({ ...editFormData, condition: e.target.value })
                    : setNewLot({ ...newLot, condition: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                value={editingLot ? editFormData.description : newLot.description}
                onChange={(e) => editingLot
                  ? setEditFormData({ ...editFormData, description: e.target.value })
                  : setNewLot({ ...newLot, description: e.target.value })
                }
                placeholder="Hand-thrown ceramic mug..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-sm">Starting Bid</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="5"
                    value={editingLot 
                      ? (editFormData.startingBidCents / 100).toFixed(0)
                      : (newLot.startingBidCents / 100).toFixed(0)
                    }
                    onChange={(e) => editingLot
                      ? setEditFormData({ ...editFormData, startingBidCents: Math.round(parseFloat(e.target.value) * 100) })
                      : setNewLot({ ...newLot, startingBidCents: Math.round(parseFloat(e.target.value) * 100) })
                    }
                    className="pl-6"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Reserve Price</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="5"
                    value={editingLot
                      ? (editFormData.reserveCents / 100).toFixed(0)
                      : (newLot.reserveCents / 100).toFixed(0)
                    }
                    onChange={(e) => editingLot
                      ? setEditFormData({ ...editFormData, reserveCents: Math.round(parseFloat(e.target.value) * 100) })
                      : setNewLot({ ...newLot, reserveCents: Math.round(parseFloat(e.target.value) * 100) })
                    }
                    className="pl-6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Hidden minimum price</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={editingLot ? () => handleUpdateLot(editingLot) : handleAddLot}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> {editingLot ? 'Update' : 'Add to Auction'}</>
                )}
              </Button>
              <Button onClick={handleCloseModal} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bid History Modal */}
      <Dialog open={showBidsModal} onOpenChange={setShowBidsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bid History</DialogTitle>
            <DialogDescription>
              {selectedLotForBids?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {/* Item Context */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-4">
              {selectedLotForBids?.mediaUrls?.[0] && (
                <div className="w-24 h-24 bg-white rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedLotForBids.mediaUrls[0]} 
                    alt={selectedLotForBids.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{selectedLotForBids?.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {selectedLotForBids?.description}
                </p>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Starting:</span>
                    <span className="font-medium ml-1">${(selectedLotForBids?.startingBidCents / 100).toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reserve:</span>
                    <span className="font-medium ml-1">${(selectedLotForBids?.reserveCents / 100).toFixed(0)}</span>
                  </div>
                  {selectedLotForBids?.currentBidCents && (
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-bold text-green-600 ml-1">${(selectedLotForBids.currentBidCents / 100).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bid List */}
            {loadingBids ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : lotBids.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {lotBids.length} {lotBids.length === 1 ? 'Bid' : 'Bids'} Placed
                </p>
                {lotBids.map((bid: any, idx: number) => (
                  <div 
                    key={bid.id}
                    className={`p-3 rounded-lg border ${
                      idx === 0 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          idx === 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          #{lotBids.length - idx}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {bid.user?.name || bid.user?.alias || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bid.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          idx === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          ${(bid.amountCents / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bid.placedAt).toLocaleDateString([], { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <span className="text-xs text-green-700 font-medium">🏆 Leading Bid</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bids placed yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
