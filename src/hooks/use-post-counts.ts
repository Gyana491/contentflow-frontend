import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/auth-store'

interface PostCounts {
  all: number
  draft: number
  scheduled: number
  published: number
}

interface PostCountsState {
  counts: PostCounts
  isLoading: boolean
  error: string | null
}

interface PostCountsActions {
  fetchCounts: () => Promise<void>
  clearError: () => void
}

export function usePostCounts(): PostCountsState & PostCountsActions {
  const { isAuthenticated, token } = useAuthStore()
  const [counts, setCounts] = useState<PostCounts>({
    all: 0,
    draft: 0,
    scheduled: 0,
    published: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated or no token, skipping fetch')
      setCounts({ all: 0, draft: 0, scheduled: 0, published: 0 })
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
      const posts = result.posts || []

             // Calculate counts
       const counts: PostCounts = {
         all: posts.length,
         draft: posts.filter((post: { status: string }) => post.status.toLowerCase() === 'draft').length,
         scheduled: posts.filter((post: { status: string }) => post.status.toLowerCase() === 'scheduled').length,
         published: posts.filter((post: { isPublished: boolean }) => post.isPublished).length
       }

      setCounts(counts)
    } catch (error) {
      console.error('Error fetching post counts:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch post counts')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return {
    counts,
    isLoading,
    error,
    fetchCounts,
    clearError
  }
} 