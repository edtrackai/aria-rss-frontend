"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/cms/ui/button'
import { Input } from '@/components/cms/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/cms/ui/use-toast'
import type { ApiError } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }
    
    if (password.length < 8) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Call the real authentication API
      await login({ email, password })
      
      toast({
        title: "Login successful",
        description: "Welcome back to NewsHub CMS!",
      })
      
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } catch (error) {
      // Handle different types of errors
      let errorMessage = "Invalid credentials"
      
      if (error && typeof error === 'object' && 'statusCode' in error) {
        // Handle specific HTTP status codes
        const apiError = error as ApiError
        switch (apiError.statusCode) {
          case 401:
            errorMessage = "Invalid email or password"
            break
          case 403:
            errorMessage = "Your account has been disabled. Please contact support."
            break
          case 429:
            errorMessage = "Too many login attempts. Please try again later."
            break
          case 500:
          case 502:
          case 503:
            errorMessage = "Server error. Please try again later."
            break
          default:
            errorMessage = apiError.message || "Server error occurred"
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage = "Unable to connect to server. Please check your connection."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              NewsHub CMS
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={isLoading}>
              Google
            </Button>
            <Button variant="outline" disabled={isLoading}>
              GitHub
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}