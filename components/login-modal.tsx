"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import googleAuthLogin from '@/lib/google-auth'

interface LoginModalProps {
  children: React.ReactNode
}

export function LoginModal({ children }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      if (isLogin) {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, formData.email, formData.password)
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        
        // Update user profile with name
        if (formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          })
        }
      }
      
      // Close modal on success
      setIsOpen(false)
      setFormData({ email: "", password: "", confirmPassword: "", name: "" })
    } catch (error: any) {
      console.error("Authentication error:", error)
      setError(error.message || "An error occurred during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await googleAuthLogin()
      if (result.success) {
        setIsOpen(false)
        setFormData({ email: "", password: "", confirmPassword: "", name: "" })
      } else {
        setError(result.error || "An error occurred during Google sign-in")
      }
    } catch (error: any) {
      console.error("Google login error:", error)
      setError(error.message || "An error occurred during Google sign-in")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError("Please enter your email address first")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      await sendPasswordResetEmail(auth, formData.email)
      setError("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError(error.message || "An error occurred sending password reset email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Join TennisMenace"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {/* Social Login Button */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </motion.div>

            {isLogin && (
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-semibold text-primary hover:text-primary/80"
              onClick={toggleMode}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
