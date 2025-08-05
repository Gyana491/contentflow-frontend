# Services and Hooks Documentation

This document describes the services and hooks available in the frontend for consuming the backend APIs.

## Overview

The frontend is organized with a service layer that handles all API communication and hooks that provide React-friendly interfaces for using these services.

## Services

### Base API Service (`/src/services/api.ts`)

The `ApiService` provides a centralized way to make HTTP requests to the backend with automatic error handling and authentication.

```typescript
import { ApiService, ApiError } from '@/services/api'

// GET request
const data = await ApiService.get<User>('/auth/me')

// POST request
const response = await ApiService.post<AuthResponse>('/auth/login', loginData)

// PUT request
await ApiService.put<User>('/auth/profile', profileData)

// DELETE request
await ApiService.delete('/auth/session')

// File upload
const formData = new FormData()
formData.append('file', file)
await ApiService.upload<UploadResponse>('/upload', formData)
```

**Features:**
- Automatic JWT token inclusion in headers
- Consistent error handling with `ApiError` class
- TypeScript support with generics
- File upload support

### Authentication Service (`/src/services/auth-service.ts`)

Handles all authentication-related API calls.

```typescript
import { AuthService } from '@/services/auth-service'

// Register a new user
const response = await AuthService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
})

// Login
const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const user = await AuthService.getCurrentUser()

// Check if user is authenticated
const isAuth = AuthService.isAuthenticated()

// Logout
await AuthService.logout()
```

### LinkedIn Service (`/src/services/linkedin-service.ts`)

Handles all LinkedIn-related API calls including OAuth, content generation, and posting.

```typescript
import { LinkedInService } from '@/services/linkedin-service'

// Get OAuth authorization URL
const { authUrl } = await LinkedInService.getAuthorizationUrl()

// Exchange code for token
const tokenResponse = await LinkedInService.exchangeCodeForToken(code, state)

// Get LinkedIn profile
const profile = await LinkedInService.getProfile(accessToken)

// Generate content
const content = await LinkedInService.generateContent({
  topic: 'AI in healthcare',
  contentType: 'article',
  tone: 'professional'
})

// Publish post
const postId = await LinkedInService.publishPost(accessToken, postData)

// Publish post with image
const postId = await LinkedInService.publishPostWithImage(
  accessToken, 
  content, 
  imageFile
)
```

### Content Service (`/src/services/content-service.ts`)

Handles content fetching and generation.

```typescript
import { ContentService } from '@/services/content-service'

// Fetch content from URL
const content = await ContentService.fetchContent({
  url: 'https://example.com/article'
})

// Generate content
const generated = await ContentService.generateContent({
  topic: 'AI trends',
  contentType: 'article',
  tone: 'professional'
})
```

## Hooks

### Authentication Hook (`/src/hooks/use-auth.ts`)

Provides authentication state and actions for React components.

```typescript
import { useAuth } from '@/hooks/use-auth'

function LoginComponent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    register 
  } = useAuth()

  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <LoginForm onLogin={handleLogin} />
  
  return <div>Welcome, {user?.firstName}!</div>
}
```

### LinkedIn Hook (`/src/hooks/use-linkedin.ts`)

Provides LinkedIn operations with loading states and error handling.

```typescript
import { useLinkedIn } from '@/hooks/use-linkedin'

function LinkedInComponent() {
  const {
    isGenerating,
    isPublishing,
    generatedContent,
    hashtags,
    error,
    generateContent,
    publishPost,
    clearError
  } = useLinkedIn()

  const handleGenerate = async () => {
    try {
      await generateContent({
        topic: 'AI in healthcare',
        contentType: 'article',
        tone: 'professional'
      })
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handlePublish = async () => {
    try {
      const postId = await publishPost(accessToken, postData)
      console.log('Published with ID:', postId)
    } catch (error) {
      console.error('Publishing failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Content'}
      </button>
      
      {generatedContent && (
        <div>
          <p>{generatedContent}</p>
          <p>Hashtags: {hashtags.join(', ')}</p>
          <button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </div>
  )
}
```

### LinkedIn OAuth Hook (`/src/hooks/use-linkedin-oauth.ts`)

Handles LinkedIn OAuth connection and profile management.

```typescript
import { useLinkedInOAuth } from '@/hooks/use-linkedin-oauth'

function LinkedInConnection() {
  const {
    isConnected,
    isLoading,
    oauthData,
    connectLinkedIn,
    disconnectLinkedIn,
    refreshProfileData
  } = useLinkedInOAuth()

  if (isLoading) return <div>Loading...</div>

  if (!isConnected) {
    return (
      <button onClick={connectLinkedIn}>
        Connect LinkedIn
      </button>
    )
  }

  return (
    <div>
      <h3>Connected to LinkedIn</h3>
      <p>Welcome, {oauthData?.profile.firstName}!</p>
      <button onClick={refreshProfileData}>Refresh Profile</button>
      <button onClick={disconnectLinkedIn}>Disconnect</button>
    </div>
  )
}
```

### Content Hook (`/src/hooks/use-content.ts`)

Handles content fetching from URLs.

```typescript
import { useContent } from '@/hooks/use-content'

function ContentFetcher() {
  const {
    isFetching,
    fetchedContent,
    error,
    fetchContent,
    clearError
  } = useContent()

  const handleFetch = async (url: string) => {
    try {
      await fetchContent({ url })
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  return (
    <div>
      <input 
        type="url" 
        placeholder="Enter URL"
        onBlur={(e) => handleFetch(e.target.value)}
      />
      
      {isFetching && <div>Fetching content...</div>}
      
      {fetchedContent && (
        <div>
          <h4>Fetched Content:</h4>
          <p>{fetchedContent}</p>
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </div>
  )
}
```

### Content Generation Hook (`/src/hooks/use-content-generation.ts`)

Handles AI content generation with the existing interface.

```typescript
import { useContentGeneration } from '@/hooks/use-content-generation'

function ContentGenerator() {
  const {
    generateContent,
    content,
    isLoading,
    error,
    reset
  } = useContentGeneration()

  const handleGenerate = async () => {
    try {
      await generateContent({
        topic: 'AI in healthcare',
        contentType: 'article',
        tone: 'professional'
      })
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Content'}
      </button>
      
      {content && (
        <div>
          <h4>Generated Content:</h4>
          <p>{content.linkedinPost}</p>
          <p>Hashtags: {content.hashtags.join(', ')}</p>
          <button onClick={reset}>Generate New</button>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  )
}
```

## Error Handling

All services and hooks use the `ApiError` class for consistent error handling:

```typescript
import { ApiError } from '@/services/api'

try {
  await AuthService.login(credentials)
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message)
    console.error('Status:', error.status)
    console.error('Details:', error.details)
    console.error('Suggestion:', error.suggestion)
  } else {
    console.error('Network error:', error)
  }
}
```

## Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Usage Examples

### Complete Authentication Flow

```typescript
import { useAuth } from '@/hooks/use-auth'

function App() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) return <LoadingSpinner />
  
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return (
    <div>
      <header>
        <h1>Welcome, {user?.firstName}!</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}
```

### LinkedIn Content Generation and Publishing

```typescript
import { useLinkedIn } from '@/hooks/use-linkedin'
import { useLinkedInOAuth } from '@/hooks/use-linkedin-oauth'

function LinkedInManager() {
  const { isConnected, oauthData } = useLinkedInOAuth()
  const { 
    generateContent, 
    publishPost, 
    isGenerating, 
    isPublishing,
    generatedContent 
  } = useLinkedIn()

  const handleGenerateAndPublish = async () => {
    try {
      // Generate content
      await generateContent({
        topic: 'AI in healthcare',
        contentType: 'article',
        tone: 'professional'
      })

      // Publish to LinkedIn
      if (generatedContent && oauthData?.accessToken) {
        const postData = {
          author: `urn:li:person:${oauthData.profile.id}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: generatedContent },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        }

        const postId = await publishPost(oauthData.accessToken, postData)
        console.log('Published with ID:', postId)
      }
    } catch (error) {
      console.error('Failed to generate and publish:', error)
    }
  }

  if (!isConnected) {
    return <div>Please connect your LinkedIn account first</div>
  }

  return (
    <div>
      <button 
        onClick={handleGenerateAndPublish}
        disabled={isGenerating || isPublishing}
      >
        {isGenerating ? 'Generating...' : 
         isPublishing ? 'Publishing...' : 
         'Generate & Publish'}
      </button>
      
      {generatedContent && (
        <div>
          <h4>Generated Content:</h4>
          <p>{generatedContent}</p>
        </div>
      )}
    </div>
  )
}
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks and check for `ApiError` instances
2. **Use loading states**: Check `isLoading`, `isGenerating`, etc. before showing content
3. **Clear errors**: Use `clearError()` functions to dismiss error messages
4. **Type safety**: Use TypeScript interfaces for all data structures
5. **Service separation**: Keep business logic in services, UI logic in hooks
6. **Consistent patterns**: Follow the established patterns for new services and hooks

## Migration Guide

If you're updating existing components to use the new services:

1. Replace direct `fetch` calls with service methods
2. Replace local state management with hook state
3. Update error handling to use `ApiError`
4. Remove manual loading state management
5. Use the provided loading states from hooks

Example migration:

```typescript
// Before
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)

const handleLogin = async () => {
  setIsLoading(true)
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    // handle success
  } catch (error) {
    setError(error.message)
  } finally {
    setIsLoading(false)
  }
}

// After
const { login, isLoading, error } = useAuth()

const handleLogin = async () => {
  try {
    await login(credentials)
    // handle success
  } catch (error) {
    // error is already handled by the hook
  }
}
``` 