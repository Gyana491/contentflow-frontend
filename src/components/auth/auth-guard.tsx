'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { authAPI } from '@/lib/auth-api';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const { isAuthenticated, token, user, logout } = useAuthStore();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        if (requireAuth) {
          router.push(redirectTo);
        }
        return;
      }

      try {
        // Validate token with server
        await authAPI.getCurrentUser(token);
        setIsValidating(false);
      } catch (error) {
        // Token is invalid, logout and redirect
        logout();
        if (requireAuth) {
          router.push(redirectTo);
        }
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, requireAuth, redirectTo, router, logout]);

  useEffect(() => {
    // Set loading to false after a short delay to prevent flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while validating
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // If authentication is not required and user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
} 