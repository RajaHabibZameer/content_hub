'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { LogOut, User, Mail, Calendar, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsPageProps {
  onLogout?: () => void
}

// Mock user data - in a real app this would come from auth context
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  initials: 'JD',
  joinedDate: 'January 2024',
  plan: 'Pro',
}

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Simulate logout delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Successfully logged out')
    setIsLoggingOut(false)
    onLogout?.()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="text-lg">{mockUser.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{mockUser.name}</h3>
              <p className="text-sm text-muted-foreground">{mockUser.plan} Member</p>
            </div>
          </div>

          <Separator />

          {/* User Details */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Address</p>
                <p className="text-sm text-muted-foreground">{mockUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Member Since</p>
                <p className="text-sm text-muted-foreground">{mockUser.joinedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Account Type</p>
                <p className="text-sm text-muted-foreground">{mockUser.plan} Plan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
          <CardDescription>
            Sign out of your account on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            {isLoggingOut ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
