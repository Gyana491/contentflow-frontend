import { useState, useEffect, useCallback } from 'react'
import { AuthService, User, RegisterData, LoginData, ForgotPasswordData, ResetPasswordData, VerifyEmailData } from '../services/auth-service'
import { ApiError } from '../services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  register: (data: RegisterData) => Promise<void>
  login: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (data: VerifyEmailData) => Promise<void>
  resendVerification: (data: ForgotPasswordData) => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const userData = await AuthService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setIsAuthenticated(false)
      AuthService.logout()
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await AuthService.register(data)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Registration failed')
    }
  }, [])

  const login = useCallback(async (data: LoginData) => {
    try {
      const response = await AuthService.login(data)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Login failed')
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await AuthService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear local state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const verifyEmail = useCallback(async (data: VerifyEmailData) => {
    try {
      await AuthService.verifyEmail(data)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Email verification failed')
    }
  }, [])

  const resendVerification = useCallback(async (data: ForgotPasswordData) => {
    try {
      await AuthService.resendVerification(data)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Failed to resend verification email')
    }
  }, [])

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    try {
      await AuthService.forgotPassword(data)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Failed to send password reset email')
    }
  }, [])

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      await AuthService.resetPassword(data)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error('Password reset failed')
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    refreshUser,
  }
} 