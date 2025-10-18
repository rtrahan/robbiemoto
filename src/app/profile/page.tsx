'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, LogOut, Save, User as UserIcon } from 'lucide-react'
import { getUser, signOut } from '@/lib/supabase-auth'
import { formatCurrency, formatDateTime } from '@/lib/helpers'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
  })
  
  const [emailPrefs, setEmailPrefs] = useState({
    auctionAlerts: true,
    outbidNotifications: true,
    winnerNotifications: true,
    newsletter: false,
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getUser()
      
      if (!userData) {
        router.push('/login')
        return
      }
      
      setUser(userData)
      
      // Load database user info
      const userResponse = await fetch('/api/user/profile')
      if (userResponse.ok) {
        const dbUserData = await userResponse.json()
        setDbUser(dbUserData)
        setFormData({
          name: dbUserData.name || '',
          email: dbUserData.email || userData.email || '',
          shippingAddress: dbUserData.shippingAddress || '',
          shippingCity: dbUserData.shippingCity || '',
          shippingState: dbUserData.shippingState || '',
          shippingZip: dbUserData.shippingZip || '',
        })
      }
      
      // Load user's bids
      const bidsResponse = await fetch('/api/user/bids')
      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json()
        setBids(bidsData)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const savePersonalInfo = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Valid email is required')
      return
    }
    
    setIsSaving(true)
    try {
      const emailChanged = formData.email !== user?.email
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          emailChanged,
          shippingAddress: formData.shippingAddress,
          shippingCity: formData.shippingCity,
          shippingState: formData.shippingState,
          shippingZip: formData.shippingZip,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update')
      }
      
      const updated = await response.json()
      setDbUser(updated.user)
      setIsEditingInfo(false)
      
      if (emailChanged) {
        toast.success('Profile updated! Check your new email to confirm the change.')
      } else {
        toast.success('Profile updated!')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }
  
  const cancelEdit = () => {
    setFormData({
      name: dbUser?.name || '',
      email: dbUser?.email || user?.email || '',
      shippingAddress: dbUser?.shippingAddress || '',
      shippingCity: dbUser?.shippingCity || '',
      shippingState: dbUser?.shippingState || '',
      shippingZip: dbUser?.shippingZip || '',
    })
    setIsEditingInfo(false)
  }

  const savePreferences = async () => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPrefs),
      })
      toast.success('Preferences saved!')
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                ← Auction
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 md:px-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your name and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingInfo ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be shown in bid history
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Changing your email will require verification
                    </p>
                  </div>
                  
                  {/* Shipping Address */}
                  <div className="space-y-3 pt-3 border-t">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-xs text-blue-700 font-medium">
                        📦 Shipping address for won items
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                        placeholder="123 Main St"
                        disabled={isSaving}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          type="text"
                          value={formData.shippingCity}
                          onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                          placeholder="San Francisco"
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          type="text"
                          value={formData.shippingState}
                          onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                          placeholder="CA"
                          disabled={isSaving}
                          maxLength={2}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        value={formData.shippingZip}
                        onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                        placeholder="94102"
                        disabled={isSaving}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={savePersonalInfo} 
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={cancelEdit} 
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-base font-medium">{dbUser?.name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-base">{dbUser?.email || user?.email || 'Not set'}</p>
                    </div>
                    
                    <div className="pt-3 border-t space-y-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                        <p className="text-xs text-blue-700 font-medium">
                          📦 Shipping Address
                        </p>
                      </div>
                      
                      {dbUser?.shippingAddress ? (
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{dbUser.shippingAddress}</p>
                          <p>{dbUser.shippingCity}, {dbUser.shippingState} {dbUser.shippingZip}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No shipping address on file</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsEditingInfo(true)} 
                    variant="outline"
                    className="w-full"
                  >
                    Edit Information
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Bid History */}
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.length > 0 ? (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{bid.lot?.title || 'Unknown Item'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(bid.placedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(bid.amountCents)}</p>
                        <p className={`text-xs ${
                          bid.status === 'WON' ? 'text-green-600' :
                          bid.status === 'LEADING' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {bid.status === 'WON' ? '🏆 Won!' :
                           bid.status === 'LEADING' ? '🔥 Leading' :
                           'Outbid'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No bids yet</p>
                  <Button onClick={() => router.push('/')} size="sm">
                    Browse Auctions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auction Alerts</Label>
                  <p className="text-xs text-muted-foreground">When new auctions start</p>
                </div>
                <Switch
                  checked={emailPrefs.auctionAlerts}
                  onCheckedChange={(checked) => setEmailPrefs({ ...emailPrefs, auctionAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Outbid Notifications</Label>
                  <p className="text-xs text-muted-foreground">When someone outbids you</p>
                </div>
                <Switch
                  checked={emailPrefs.outbidNotifications}
                  onCheckedChange={(checked) => setEmailPrefs({ ...emailPrefs, outbidNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Winner Notifications</Label>
                  <p className="text-xs text-muted-foreground">When you win an auction</p>
                </div>
                <Switch
                  checked={emailPrefs.winnerNotifications}
                  onCheckedChange={(checked) => setEmailPrefs({ ...emailPrefs, winnerNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Monthly Newsletter</Label>
                  <p className="text-xs text-muted-foreground">Updates and new drops</p>
                </div>
                <Switch
                  checked={emailPrefs.newsletter}
                  onCheckedChange={(checked) => setEmailPrefs({ ...emailPrefs, newsletter: checked })}
                />
              </div>

              <Button onClick={savePreferences} className="w-full">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

