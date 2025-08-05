import { useState, useCallback } from 'react'
import { LinkedInService, LinkedInPostData, ContentGenerationRequest, LinkedInProfile, LinkedInPost } from '../services/linkedin-service'
import { ApiError } from '../services/api'

interface DatabasePost {
  id: string
  userId: string
  title: string | null
  content: string
  hashtags: string[]
  contentType: string
  tone: string
  status: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  linkedInPostId: string | null
  linkedInUrl: string | null
  // Image fields for LinkedIn posts
  imageUrl: string | null
  imageAssetUrn: string | null
  imageTitle: string | null
  imageDescription: string | null
  scheduledPost?: {
    id: string
    scheduledAt: string
    timezone: string
    status: string
  } | null
}

interface LinkedInState {
  isGenerating: boolean
  isPublishing: boolean
  isFetchingProfile: boolean
  isFetchingPosts: boolean
  isFetchingDatabasePosts: boolean
  generatedContent: string | null
  hashtags: string[]
  error: string | null
  databasePosts: DatabasePost[]
}

interface LinkedInActions {
  generateContent: (request: ContentGenerationRequest) => Promise<void>
  publishPost: (accessToken: string, postData: LinkedInPostData) => Promise<string>
  publishPostWithImage: (accessToken: string, content: string, imageFile: File) => Promise<string>
  getProfile: (accessToken: string) => Promise<LinkedInProfile>
  getPosts: (accessToken: string, authorId: string) => Promise<LinkedInPost[]>
  getDatabasePosts: (linkedInAuthId: string) => Promise<DatabasePost[]>
  clearError: () => void
  clearGeneratedContent: () => void
}

export function useLinkedIn(): LinkedInState & LinkedInActions {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [isFetchingPosts, setIsFetchingPosts] = useState(false)
  const [isFetchingDatabasePosts, setIsFetchingDatabasePosts] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [databasePosts, setDatabasePosts] = useState<DatabasePost[]>([])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearGeneratedContent = useCallback(() => {
    setGeneratedContent(null)
    setHashtags([])
  }, [])

  const generateContent = useCallback(async (request: ContentGenerationRequest) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await LinkedInService.generateContent(request)
      setGeneratedContent(response.data.linkedinPost)
      setHashtags(response.data.hashtags)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to generate content')
      }
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const publishPost = useCallback(async (accessToken: string, postData: LinkedInPostData): Promise<string> => {
    setIsPublishing(true)
    setError(null)
    
    try {
      const response = await LinkedInService.publishPost(accessToken, postData)
      return response.id
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to publish post')
      }
      throw error
    } finally {
      setIsPublishing(false)
    }
  }, [])

  const publishPostWithImage = useCallback(async (
    accessToken: string, 
    content: string, 
    imageFile: File
  ): Promise<string> => {
    setIsPublishing(true)
    setError(null)
    
    try {
      const response = await LinkedInService.publishPostWithImage(accessToken, content, imageFile)
      return response.id
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to publish post with image')
      }
      throw error
    } finally {
      setIsPublishing(false)
    }
  }, [])

  const getProfile = useCallback(async (accessToken: string): Promise<LinkedInProfile> => {
    setIsFetchingProfile(true)
    setError(null)
    
    try {
      return await LinkedInService.getProfile(accessToken)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to fetch profile')
      }
      throw error
    } finally {
      setIsFetchingProfile(false)
    }
  }, [])

  const getPosts = useCallback(async (accessToken: string, authorId: string): Promise<LinkedInPost[]> => {
    setIsFetchingPosts(true)
    setError(null)
    
    try {
      return await LinkedInService.getPosts(accessToken, authorId)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to fetch posts')
      }
      throw error
    } finally {
      setIsFetchingPosts(false)
    }
  }, [])

  const getDatabasePosts = useCallback(async (linkedInAuthId: string): Promise<DatabasePost[]> => {
    setIsFetchingDatabasePosts(true)
    setError(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/user-posts?linkedInAuthId=${encodeURIComponent(linkedInAuthId)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch database posts')
      }

      const result = await response.json()
      setDatabasePosts(result.posts)
      return result.posts
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to fetch database posts')
      }
      throw error
    } finally {
      setIsFetchingDatabasePosts(false)
    }
  }, [])

  return {
    isGenerating,
    isPublishing,
    isFetchingProfile,
    isFetchingPosts,
    isFetchingDatabasePosts,
    generatedContent,
    hashtags,
    error,
    databasePosts,
    generateContent,
    publishPost,
    publishPostWithImage,
    getProfile,
    getPosts,
    getDatabasePosts,
    clearError,
    clearGeneratedContent,
  }
} 