"use client"

import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Linkedin, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface LinkedInConnectionBannerProps {
  className?: string
  showDetails?: boolean
}

export function LinkedInConnectionBanner({ className = "", showDetails = false }: LinkedInConnectionBannerProps) {
  const { isConnected, isLoading, oauthData, connectLinkedIn, disconnectLinkedIn } = useLinkedInOAuth()

  // Don't show the banner if user is connected or still loading
  if (isLoading || isConnected) {
    return null
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <Linkedin className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">LinkedIn</span>
                <Badge variant="secondary">
                  Not Connected
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={connectLinkedIn}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 