const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface ApiResponse<T = Record<string, unknown>> {
  data?: T
  error?: string
  details?: string
  suggestion?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string,
    public suggestion?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      console.log(`Making API request to: ${url}`, {
        method: config.method,
        headers: config.headers,
        body: config.body
      });
      
      const response = await fetch(url, config)
      const data: ApiResponse<T> = await response.json()

      console.log(`API Response for ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        data: data,
        hasDataField: 'data' in data,
        dataField: data.data
      })

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data.details,
          data.suggestion
        )
      }

      // Handle both wrapped and unwrapped responses
      const result = data.data !== undefined ? data.data : data
      console.log(`Returning result for ${endpoint}:`, result)
      return result as T
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle network errors more specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error: Unable to connect to the server. Please check if the server is running.',
          0
        )
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  static async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  static async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data.details,
          data.suggestion
        )
      }

      // Handle both wrapped and unwrapped responses
      const result = data.data !== undefined ? data.data : data
      return result as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }
}

export { ApiError } 