"use client"

import { useState, useEffect } from 'react'
import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"
import { LinkedInPostEditor } from "@/components/linkedin-post-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Linkedin, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function LinkedInEditorPage() {
  const { isConnected, isLoading, oauthData, connectLinkedIn } = useLinkedInOAuth()
  const router = useRouter()

  // Redirect to LinkedIn settings if not connected
  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.push('/dashboard/linkedin')
    }
  }, [isConnected, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking LinkedIn connection...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Linkedin className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>LinkedIn Connection Required</CardTitle>
            <CardDescription>
              You need to connect your LinkedIn account to create and publish posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your LinkedIn account to access the post editor and publishing features.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={connectLinkedIn} className="flex-1">
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/linkedin')}>
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">LinkedIn Post Editor</h1>
            <p className="text-muted-foreground">
              Create and publish LinkedIn posts with live preview
            </p>
          </div>
          {oauthData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Connected as {oauthData.profile.firstName} {oauthData.profile.lastName}
            </div>
          )}
        </div>
      </div>
      
      <LinkedInPostEditor />
    </div>
  )
} 