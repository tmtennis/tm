'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Star } from 'lucide-react'
import { PremiumUpgrade } from '@/components/premium-upgrade'

interface PremiumContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function PremiumContent({ children, fallback, showUpgrade = true }: PremiumContentProps) {
  const { isPremium, user, loading } = useAuth()

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-32" />
  }

  if (!user) {
    return fallback || null
  }

  if (isPremium) {
    return <>{children}</>
  }

  return fallback || (
    <Card className="border-2 border-dashed border-amber-200 bg-amber-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-amber-600" />
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Premium Only
          </Badge>
        </div>
        <CardTitle className="text-amber-900">Unlock Premium Content</CardTitle>
        <CardDescription className="text-amber-700">
          Get access to exclusive features, detailed analytics, and advanced tools
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">Advanced player statistics</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">Detailed match predictions</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Star className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">Historical performance data</span>
          </div>
          {showUpgrade && (
            <div className="pt-4">
              <PremiumUpgrade />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Premium badge component for UI elements
export function PremiumBadge() {
  return (
    <Badge variant="outline" className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-500">
      <Crown className="h-3 w-3 mr-1" />
      Premium
    </Badge>
  )
}

// Hook to check if user has premium access
export function usePremium() {
  const { isPremium, user } = useAuth()
  return { isPremium, user }
}
