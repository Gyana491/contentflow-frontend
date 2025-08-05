import { ApiService } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  emailVerified: boolean
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface VerifyEmailData {
  token: string
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/auth/register', data)
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }
    return response
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/auth/login', data)
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }
    return response
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  static async getCurrentUser(): Promise<User> {
    return ApiService.get<User>('/auth/me')
  }

  static async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/verify-email', data)
  }

  static async resendVerification(data: ForgotPasswordData): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/resend-verification', data)
  }

  static async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/forgot-password', data)
  }

  static async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return ApiService.post<{ message: string }>('/auth/reset-password', data)
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  static setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }
} 