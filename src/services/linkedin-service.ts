import { ApiService } from './api'

export interface LinkedInProfile {
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

export interface LinkedInAuthResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface LinkedInPostData {
  author: string
  lifecycleState: string
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string
      }
      shareMediaCategory: string
    }
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string
  }
}

export interface LinkedInPost {
  id: string
  content: string
  publishedAt: string
  author: string
}

export interface ContentGenerationRequest {
  topic: string
  contentType: string
  tone: string
  scheduledTime?: string
}

export interface ContentGenerationResponse {
  success: boolean
  data: {
    linkedinPost: string
    hashtags: string[]
    topic: string
  }
  runId: string
}

export class LinkedInService {
  static async getAuthorizationUrl(): Promise<{ authUrl: string }> {
    return ApiService.get<{ authUrl: string }>('/auth/linkedin/authorize')
  }

  static async exchangeCodeForToken(code: string, state: string): Promise<LinkedInAuthResponse> {
    return ApiService.post<LinkedInAuthResponse>('/auth/linkedin/token', { code, state })
  }

  static async refreshToken(linkedInAuthId: string): Promise<LinkedInAuthResponse> {
    return ApiService.post<LinkedInAuthResponse>('/auth/linkedin/refresh', { linkedInAuthId })
  }

  static async getProfile(accessToken: string): Promise<LinkedInProfile> {
    return ApiService.post<LinkedInProfile>('/auth/linkedin/profile', { accessToken })
  }

  static async completeOAuth(
    accessToken: string, 
    profile: LinkedInProfile, 
    refreshToken?: string, 
    expiresIn?: number,
    currentUserId?: string
  ): Promise<{
    message: string
    user: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      emailVerified: boolean
    }
    linkedInAuth: {
      id: string
      linkedInId: string
      firstName: string
      lastName: string
      email: string | null
      profilePicture: string | null
      connectedAt: string
      profileFetchedAt: string | null
    }
  }> {
    return ApiService.post('/auth/linkedin/complete', { 
      accessToken, 
      profile, 
      refreshToken, 
      expiresIn,
      currentUserId
    })
  }

  static async publishPost(accessToken: string, postData: LinkedInPostData): Promise<{ id: string }> {
    return ApiService.post<{ id: string }>('/linkedin/publish', {
      accessToken,
      postData
    })
  }

  static async publishPostWithImage(
    accessToken: string,
    content: string,
    imageFile: File
  ): Promise<{ id: string }> {
    const formData = new FormData()
    formData.append('accessToken', accessToken)
    formData.append('content', content)
    formData.append('imageFile', imageFile)

    return ApiService.upload<{ id: string }>('/linkedin/publish-with-image', formData)
  }

  static async getProfileInfo(accessToken: string): Promise<LinkedInProfile> {
    return ApiService.get<LinkedInProfile>(`/linkedin/profile?accessToken=${encodeURIComponent(accessToken)}`)
  }

  static async getPosts(accessToken: string, authorId: string): Promise<LinkedInPost[]> {
    return ApiService.get<LinkedInPost[]>(`/linkedin/posts?accessToken=${encodeURIComponent(accessToken)}&authorId=${encodeURIComponent(authorId)}`)
  }

  static async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return ApiService.post<ContentGenerationResponse>('/generate', request)
  }
} 