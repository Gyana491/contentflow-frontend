import { useState, useCallback } from 'react'
import { ContentService, FetchContentRequest } from '../services/content-service'
import { ApiError } from '../services/api'

interface ContentState {
  isFetching: boolean
  fetchedContent: string | null
  error: string | null
}

interface ContentActions {
  fetchContent: (request: FetchContentRequest) => Promise<void>
  clearError: () => void
  clearContent: () => void
}

export function useContent(): ContentState & ContentActions {
  const [isFetching, setIsFetching] = useState(false)
  const [fetchedContent, setFetchedContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearContent = useCallback(() => {
    setFetchedContent(null)
  }, [])

  const fetchContent = useCallback(async (request: FetchContentRequest) => {
    setIsFetching(true)
    setError(null)
    
    try {
      const response = await ContentService.fetchContent(request)
      setFetchedContent(response.content)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to fetch content')
      }
      throw error
    } finally {
      setIsFetching(false)
    }
  }, [])

  return {
    isFetching,
    fetchedContent,
    error,
    fetchContent,
    clearError,
    clearContent,
  }
} 