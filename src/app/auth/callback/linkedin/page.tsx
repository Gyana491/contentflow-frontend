"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Linkedin } from 'lucide-react'
import { LinkedInService } from '@/services/linkedin-service'
import { ApiError } from '@/services/api'
import { useAuthStore } from '@/lib/auth-store'

interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  email?: string
}

export default function LinkedInCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        if (error) {
          setError(`LinkedIn authorization failed: ${error}`)
          setStatus('error')
          return
        }

        if (!code) {
          setError('No authorization code received from LinkedIn')
          setStatus('error')
          return
        }

        // Get user ID from auth store or localStorage as fallback
        let currentUserId = user?.id;
        if (!currentUserId) {
          // Try to get from localStorage as fallback
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const authData = JSON.parse(authStorage);
              currentUserId = authData.state?.user?.id;
              console.log('Got user ID from localStorage:', currentUserId);
            }
          } catch (e) {
            console.error('Error reading from localStorage:', e);
          }
        }

        if (!currentUserId) {
          console.log('No user ID found:', { isAuthenticated, userId: user?.id });
          setError('User authentication required. Please log in first.')
          setStatus('error')
          return
        }

        // Exchange authorization code for access token
        const tokenData: LinkedInTokenResponse = await LinkedInService.exchangeCodeForToken(code, state || '')
        console.log('Token exchange successful:', tokenData)

        // Fetch user profile
        const profileData: LinkedInProfile = await LinkedInService.getProfile(tokenData.access_token)
        console.log('Profile fetch successful:', profileData)

        // Complete OAuth flow and store in database
        console.log('Current user from auth store:', user);
        console.log('Current user ID:', currentUserId);
        
        const completeData = await LinkedInService.completeOAuth(
          tokenData.access_token, 
          profileData,
          tokenData.refresh_token,
          tokenData.expires_in,
          currentUserId // Pass current user ID if authenticated
        )
        console.log('OAuth completion successful:', completeData)

        // Validate the response structure with detailed logging
        if (!completeData) {
          console.error('Complete data is null or undefined')
          throw new Error('No response received from OAuth completion')
        }

        console.log('Complete data structure:', {
          hasLinkedInAuth: !!completeData.linkedInAuth,
          linkedInAuthKeys: completeData.linkedInAuth ? Object.keys(completeData.linkedInAuth) : 'N/A',
          hasUser: !!completeData.user,
          userKeys: completeData.user ? Object.keys(completeData.user) : 'N/A'
        })

        if (!completeData.linkedInAuth) {
          console.error('LinkedIn auth data is missing from response:', completeData)
          throw new Error('Invalid response from OAuth completion - missing LinkedIn auth data')
        }

        if (!completeData.linkedInAuth.id) {
          console.error('LinkedIn auth ID is missing:', completeData.linkedInAuth)
          throw new Error('Invalid response from OAuth completion - missing LinkedIn auth ID')
        }

        if (!completeData.user) {
          console.error('User data is missing from response:', completeData)
          throw new Error('Invalid response from OAuth completion - missing user data')
        }

        if (!completeData.user.id) {
          console.error('User ID is missing:', completeData.user)
          throw new Error('Invalid response from OAuth completion - missing user ID')
        }

        // Store the linkedInAuthId in sessionStorage for current session
        sessionStorage.setItem('linkedin_auth_id', completeData.linkedInAuth.id)
        sessionStorage.setItem('user_id', completeData.user.id)

        setProfile(profileData)
        setStatus('success')

        // Redirect to LinkedIn dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/linkedin')
        }, 2000)

      } catch (err) {
        console.error('LinkedIn callback error:', err)
        if (err instanceof ApiError) {
          setError(err.message)
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          console.error('Unexpected error type:', typeof err, err)
          setError('An unexpected error occurred during LinkedIn connection')
        }
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleRetry = async () => {
    try {
      const { authUrl } = await LinkedInService.getAuthorizationUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error getting authorization URL:', error)
      router.push('/dashboard/linkedin')
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard/linkedin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Linkedin className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle>LinkedIn Connection</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Connecting your LinkedIn account...'}
            {status === 'success' && 'Successfully connected to LinkedIn!'}
            {status === 'error' && 'Failed to connect to LinkedIn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              {profile && (
                <div className="text-center space-y-4">
                  {profile.profilePicture && (
                    <div className="flex justify-center">
                      <img 
                        src={profile.profilePicture} 
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-16 h-16 rounded-full border-2 border-green-200"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="font-medium text-lg">
                      Welcome, {profile.firstName} {profile.lastName}!
                    </p>
                    <p className="text-sm text-gray-600">
                      Your LinkedIn account has been successfully connected.
                    </p>
                  </div>
                </div>
              )}
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to LinkedIn Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-red-600">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-red-600 font-medium">Connection Failed</p>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 