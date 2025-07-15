'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <XCircle className="h-16 w-16 text-red-600" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl text-red-900">Payment Cancelled</CardTitle>
            <CardDescription className="text-red-700">
              Your payment was cancelled. No charges were made to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-red-800">
                You can still upgrade to premium anytime to unlock exclusive features.
              </p>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-900">Premium features include:</h3>
                <div className="grid gap-3 text-left">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Advanced player statistics and analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Detailed match predictions and insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Historical performance data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Priority support and exclusive features</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              
              <p className="text-sm text-red-600">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
