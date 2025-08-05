import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/auth-store'

export interface DatabasePost {
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

interface PostsState {
  posts: DatabasePost[]
  isLoading: boolean
  error: string | null
}

interface PostsActions {
  fetchPosts: () => Promise<void>
  clearError: () => void
  createDraft: (draftData: Partial<DatabasePost>) => Promise<DatabasePost | null>
  updatePost: (postId: string, updateData: Partial<DatabasePost>) => Promise<DatabasePost | null>
  deletePost: (postId: string) => Promise<boolean>
}

export function usePosts(): PostsState & PostsActions {
  const { isAuthenticated, token } = useAuthStore()
  const [posts, setPosts] = useState<DatabasePost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchPosts = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated or no token, skipping fetch')
      setPosts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch posts`)
      }

      const result = await response.json()
      setPosts(result.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch posts')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, token])

  const createDraft = useCallback(async (draftData: Partial<DatabasePost>) => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated or no token, cannot create draft')
      return null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create draft`)
      }

      const result = await response.json()
      // Refresh posts list to include the new draft
      await fetchPosts()
      return result.post
    } catch (error) {
      console.error('Error creating draft:', error)
      setError(error instanceof Error ? error.message : 'Failed to create draft')
      return null
    }
  }, [isAuthenticated, token, fetchPosts])

  const updatePost = useCallback(async (postId: string, updateData: Partial<DatabasePost>) => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated or no token, cannot update post')
      return null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update post`)
      }

      const result = await response.json()
      // Refresh posts list to reflect the update
      await fetchPosts()
      return result.post
    } catch (error) {
      console.error('Error updating post:', error)
      setError(error instanceof Error ? error.message : 'Failed to update post')
      return null
    }
  }, [isAuthenticated, token, fetchPosts])

  const deletePost = useCallback(async (postId: string) => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated or no token, cannot delete post')
      return false
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete post`)
      }

      // Refresh posts list to reflect the deletion
      await fetchPosts()
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete post')
      return false
    }
  }, [isAuthenticated, token, fetchPosts])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    clearError,
    createDraft,
    updatePost,
    deletePost
  }
} 