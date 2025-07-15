'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SuccessPage() {
  const { user, refreshUserData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Refresh user data to get updated premium status
    if (user) {
      // Add a small delay to ensure webhook has processed
      setTimeout(() => {
        refreshUserData()
      }, 2000)
    }
  }, [user, refreshUserData])

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CheckCircle className="h-16 w-16 text-green-600" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl text-green-900">Payment Successful!</CardTitle>
            <CardDescription className="text-green-700">
              Welcome to TennisMenace Premium! Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-amber-600" />
              <span className="text-lg font-semibold text-amber-800">Premium Access Unlocked</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-900">What's included:</h3>
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced player statistics and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Detailed match predictions and insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Historical performance data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support and exclusive features</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Exploring Premium Features
              </Button>
              
              <p className="text-sm text-green-600">
                Your premium features will be available immediately. If you don't see them, try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
