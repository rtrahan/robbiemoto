'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { signIn, signUp } from '@/lib/supabase-auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        if (!name.trim()) {
          toast.error('Please enter your name')
          setIsLoading(false)
          return
        }
        
        const { data } = await signUp(email, password)
        
        // Create user in database with name and address
        if (data.user) {
          const userResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              supabaseId: data.user.id,
              shippingAddress: address,
              shippingCity: city,
              shippingState: state,
              shippingZip: zipCode,
              emailNotifications,
            }),
          })
          
          if (!userResponse.ok) {
            const errorData = await userResponse.json()
            console.error('Failed to create user in database:', errorData)
            toast.error('Account created but profile setup failed. Please contact support.')
            setIsLoading(false)
            return
          }
          
          console.log('User profile created successfully')
        }
        
        toast.success('Account created!')
        router.push('/')
        router.refresh()
      } else {
        await signIn(email, password)
        
        // Check if admin and set admin session
        const adminEmails = ['admin@robbiemoto.com', 'robbiemoto@gmail.com']
        if (adminEmails.includes(email.toLowerCase())) {
          // Set admin cookie
          await fetch('/api/auth/admin-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          
          toast.success('Admin logged in!')
          router.push('/admin')
        } else {
          toast.success('Logged in!')
          router.push('/')
        }
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center font-serif text-2xl font-light">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Sign up to start bidding on handcrafted ceramics' : 'Login to place bids and track your auctions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be shown in bid history
                  </p>
                </div>
                
                {/* Shipping Address Section */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium mb-1">
                      📦 Shipping Information
                    </p>
                    <p className="text-xs text-blue-600">
                      We'll use this to ship items you win. You can update it later in your profile.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="San Francisco"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="CA"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={isLoading}
                        required
                        maxLength={2}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="94102"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={isLoading}
                      required
                      maxLength={10}
                    />
                  </div>
                </div>
                
                {/* Email Notifications */}
                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="notifications" className="cursor-pointer">
                      Email me about new auctions and outbid notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You can change this anytime in your profile
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Logging in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Login'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="/"
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              ← Back to auction
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

