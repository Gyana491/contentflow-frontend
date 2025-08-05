'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Linkedin, Sparkles, Clock, BarChart3, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/lib/auth-store"

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Linkedin className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">ContentFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="h-4 w-4 mr-1" />
          AI-Powered Content Creation
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Generate Viral LinkedIn Posts with AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Create engaging LinkedIn content, preview how it looks, and schedule posts directly to your LinkedIn account.
          Boost your professional presence with AI-generated viral content.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={handleGetStarted}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Creating Posts'}
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Go Viral</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI Post Generation</CardTitle>
              <CardDescription>
                Generate viral LinkedIn posts using advanced AI that understands trending topics and engagement
                patterns.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Linkedin className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Live LinkedIn Preview</CardTitle>
              <CardDescription>
                See exactly how your post will look in the LinkedIn feed before publishing. Perfect formatting every
                time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Schedule posts for optimal engagement times or publish immediately to your connected LinkedIn account.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                Visualize your content strategy with a comprehensive calendar view of all scheduled posts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>LinkedIn Integration</CardTitle>
              <CardDescription>
                Seamlessly connect your LinkedIn account for direct posting and scheduling without leaving the platform.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Track engagement metrics and optimize your content strategy with detailed analytics and insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Viral on LinkedIn?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who are already using ContentFlow to boost their LinkedIn presence.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8"
            onClick={handleGetStarted}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Your Free Trial'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Linkedin className="h-6 w-6" />
            <span className="text-lg font-semibold">ContentFlow</span>
          </div>
          <p className="text-gray-400">© 2024 ContentFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
