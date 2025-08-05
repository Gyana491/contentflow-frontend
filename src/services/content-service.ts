import { ApiService } from './api'

export interface FetchContentRequest {
  url: string
}

export interface FetchContentResponse {
  content: string
  url: string
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

export class ContentService {
  static async fetchContent(request: FetchContentRequest): Promise<FetchContentResponse> {
    return ApiService.post<FetchContentResponse>('/fetch-content', request)
  }

  static async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return ApiService.post<ContentGenerationResponse>('/generate', request)
  }
} 