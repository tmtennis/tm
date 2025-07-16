"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import handleGoogleLogin from "@/lib/google-auth"
import { useState } from "react"

export default function AuthTestPage() {
  const { user, loading, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const testGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await handleGoogleLogin()
      if (!result.success) {
        setError(result.error || "Google login failed")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Firebase Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="text-center space-y-4">
              <p className="text-green-600">✅ Logged in successfully!</p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
                <p><strong>UID:</strong> {user.uid}</p>
              </div>
              <Button onClick={logout} variant="destructive" className="w-full">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={testGoogleLogin} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Test Google Login"}
              </Button>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
