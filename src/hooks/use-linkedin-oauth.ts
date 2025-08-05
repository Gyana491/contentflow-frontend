import { useState, useEffect, useCallback } from 'react'
import { LinkedInService } from '../services/linkedin-service'
import { ApiError } from '../services/api'

interface LinkedInOAuthData {
  accessToken: string
  expiresIn: number
  refreshToken?: string
  scope: string
  profile: {
    id: string
    firstName: string
    lastName: string
    name?: string
    profilePicture?: string
    email?: string
    emailVerified?: boolean
    locale?: string
    headline?: string
    vanityName?: string
    industry?: string
    location?: string
  }
  connectedAt: string
  profileFetchedAt?: string
  userId?: string
  linkedInAuthId?: string
}

export function useLinkedInOAuth() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [oauthData, setOauthData] = useState<LinkedInOAuthData | null>(null)

  // Check connection status from database via API
  const checkConnectionStatus = useCallback(async () => {
    try {
      const linkedInAuthId = sessionStorage.getItem('linkedin_auth_id')
      
      if (linkedInAuthId) {
        // Get connection status from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin/status/${linkedInAuthId}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.isConnected) {
            // Convert database response to oauthData format
            const oauthData: LinkedInOAuthData = {
              accessToken: '', // We don't store access tokens in frontend
              expiresIn: 3600,
              scope: 'openid profile w_member_social email',
              profile: data.profile,
              connectedAt: data.linkedInAuth.connectedAt,
              profileFetchedAt: data.linkedInAuth.profileFetchedAt,
              userId: data.user.id,
              linkedInAuthId: data.linkedInAuth.id,
            }
            
            setOauthData(oauthData)
            setIsConnected(true)
            return true
          } else {
            // Token expired
            setIsConnected(false)
            setOauthData(null)
            return false
          }
        } else {
          // Connection not found or error
          setIsConnected(false)
          setOauthData(null)
          return false
        }
      } else {
        // No connection found
        setIsConnected(false)
        setOauthData(null)
        return false
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      setIsConnected(false)
      setOauthData(null)
      return false
    }
  }, [])

  // Initialize connection status on mount
  useEffect(() => {
    const initializeConnection = async () => {
      setIsLoading(true)
      
      const isConnected = await checkConnectionStatus()
      
      setIsLoading(false)
    }

    initializeConnection()
  }, [checkConnectionStatus])

  const connectLinkedIn = async () => {
    try {
      const { authUrl } = await LinkedInService.getAuthorizationUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Failed to get LinkedIn authorization URL')
    }
  }

  const disconnectLinkedIn = () => {
    // Clear session storage
    sessionStorage.removeItem('linkedin_auth_id')
    sessionStorage.removeItem('user_id')
    setOauthData(null)
    setIsConnected(false)
  }

  const getAccessToken = (): string | null => {
    // Access tokens are not stored in frontend for security
    // They should be retrieved from backend when needed
    return null
  }

  const fetchCompleteProfile = useCallback(async () => {
    if (!oauthData?.linkedInAuthId || isFetchingProfile) return

    // Check if we already have complete profile data
    const hasCompleteProfile = oauthData.profile.profilePicture && 
                              oauthData.profile.firstName && 
                              oauthData.profile.lastName
    
    if (hasCompleteProfile) {
      return // Don't fetch if we already have complete data
    }

    setIsFetchingProfile(true)

    try {
      // Get profile from backend using linkedInAuthId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: '', // We don't have access token in frontend
          linkedInAuthId: oauthData.linkedInAuthId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle rate limit specifically
        if (errorData.rateLimited) {
          console.warn('LinkedIn API rate limited, using cached profile data')
          return // Use existing data instead of throwing error
        }
        
        throw new Error(errorData.error || 'Failed to fetch profile')
      }

      const profileData = await response.json()

      // Update stored data with complete profile
      const updatedData = {
        ...oauthData,
        profile: profileData,
        profileFetchedAt: new Date().toISOString(),
      }

      setOauthData(updatedData)
    } catch (error) {
      console.error('Error fetching complete profile:', error)
      // Don't throw error, just log it and continue with existing data
    } finally {
      setIsFetchingProfile(false)
    }
  }, [oauthData?.linkedInAuthId, isFetchingProfile])

  const refreshProfileData = useCallback(async () => {
    // Force refresh profile data even if we have cached data
    if (!oauthData?.linkedInAuthId) return
    
    setIsFetchingProfile(true)
    try {
      // Get profile from backend using linkedInAuthId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accessToken: '', // We don't have access token in frontend
          linkedInAuthId: oauthData.linkedInAuthId
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }

      const profileData = await response.json()

      const updatedData = {
        ...oauthData,
        profile: {
          ...oauthData.profile,
          ...profileData,
        },
        profileFetchedAt: new Date().toISOString()
      }

      setOauthData(updatedData)
    } catch (error) {
      console.error('Failed to refresh profile data:', error)
    } finally {
      setIsFetchingProfile(false)
    }
  }, [oauthData?.linkedInAuthId])

  const refreshAccessToken = useCallback(async () => {
    if (!oauthData?.linkedInAuthId) return null
    
    try {
      console.log('Refreshing access token for LinkedIn Auth ID:', oauthData.linkedInAuthId)
      
      const response = await LinkedInService.refreshToken(oauthData.linkedInAuthId)
      
      console.log('Token refresh successful:', response)
      
      // Update the stored data with new token info
      const updatedData = {
        ...oauthData,
        accessToken: response.access_token,
        expiresIn: response.expires_in,
      }
      
      setOauthData(updatedData)
      return response.access_token
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      
      // If refresh token is expired, we need to re-authenticate
      if (error instanceof ApiError && error.status === 400) {
        console.log('Refresh token expired, need to re-authenticate')
        disconnectLinkedIn()
      }
      
      return null
    }
  }, [oauthData?.linkedInAuthId])

  // Fetch complete profile only once when user is connected and profile data is missing
  useEffect(() => {
    if (isConnected && oauthData && !isFetchingProfile) {
      // Check if we already have complete profile data
      const hasCompleteProfile = oauthData.profile.profilePicture && 
                                oauthData.profile.firstName && 
                                oauthData.profile.lastName
      
      if (!hasCompleteProfile) {
        fetchCompleteProfile()
      }
    }
  }, [isConnected, oauthData?.linkedInAuthId, fetchCompleteProfile, isFetchingProfile])

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!oauthData?.linkedInAuthId) return

    const checkTokenExpiry = async () => {
      // Check if token expires in the next 5 minutes
      const now = Date.now()
      const tokenExpiryTime = new Date(oauthData.connectedAt).getTime() + (oauthData.expiresIn * 1000)
      const fiveMinutesFromNow = now + (5 * 60 * 1000)

      if (tokenExpiryTime <= fiveMinutesFromNow) {
        console.log('Token expires soon, refreshing...')
        await refreshAccessToken()
      }
    }

    // Check immediately
    checkTokenExpiry()

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [oauthData?.linkedInAuthId, oauthData?.connectedAt, oauthData?.expiresIn, refreshAccessToken])

  return {
    isConnected,
    isLoading,
    isFetchingProfile,
    oauthData,
    connectLinkedIn,
    disconnectLinkedIn,
    getAccessToken,
    fetchCompleteProfile,
    refreshProfileData,
    refreshAccessToken,
  }
} 