"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Linkedin, 
  CheckCircle, 
  XCircle, 
  User, 
  Building, 
  Globe, 
  Settings,
  LogOut,
  Headphones,
  Loader2,
  Send
} from "lucide-react"
import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"

export default function LinkedInPage() {
  const { isConnected, isLoading, oauthData, connectLinkedIn, disconnectLinkedIn } = useLinkedInOAuth()
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Calcutta")
  const router = useRouter()

  const timezones = [
    { value: "Asia/Calcutta", label: "Asia/Calcutta" },
    { value: "America/New_York", label: "America/New_York" },
    { value: "Europe/London", label: "Europe/London" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo" },
    { value: "Australia/Sydney", label: "Australia/Sydney" },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">LinkedIn Settings</h1>
        <p className="text-muted-foreground">
          Manage your LinkedIn account connection and preferences
        </p>
      </div>

      {/* Account Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected && oauthData?.profile?.profilePicture ? (
                <img 
                  src={oauthData.profile.profilePicture} 
                  alt={`${oauthData.profile.firstName} ${oauthData.profile.lastName}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <Linkedin className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : isConnected && oauthData ? (
                    `Logged in as: ${oauthData.profile.firstName} ${oauthData.profile.lastName}`
                  ) : (
                    "Not connected to LinkedIn"
                  )}
                </CardTitle>
                <CardDescription>
                  {isConnected ? "You can schedule your posts and analyze your metrics." : "Connect your LinkedIn account to get started."}
                </CardDescription>
              </div>
            </div>
            {isConnected && (
              <Button 
                variant="outline" 
                onClick={disconnectLinkedIn}
                className="text-gray-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">LinkedIn Connection</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Connected to LinkedIn" : "Not connected"}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {!isConnected && !isLoading && (
            <Button onClick={connectLinkedIn} className="w-full">
              <Linkedin className="h-4 w-4 mr-2" />
              Connect LinkedIn Account
            </Button>
          )}

          {isConnected && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/test-linkedin')}>
                Test Connection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      {isConnected && oauthData && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture Section */}
            {oauthData.profile.profilePicture && (
              <div className="flex justify-center mb-4">
                <div className="text-center">
                  <img 
                    src={oauthData.profile.profilePicture} 
                    alt={`${oauthData.profile.firstName} ${oauthData.profile.lastName}`}
                    className="h-24 w-24 rounded-full object-cover border-4 border-blue-200 mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Profile Picture</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">
                    {oauthData.profile.firstName} {oauthData.profile.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">LinkedIn ID</p>
                  <p className="text-sm text-muted-foreground">{oauthData.profile.id}</p>
                </div>
              </div>
              
              {oauthData.profile.email && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{oauthData.profile.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Settings className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Connected Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(oauthData.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Zone Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Time Zone</CardTitle>
          <CardDescription>
            Mon, Aug 04, 08:02 AM, in your timezone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timezone">Select your timezone</Label>
            <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posting Permissions */}
      {isConnected && oauthData && (
        <Card>
          <CardHeader>
            <CardTitle>Posting Permissions</CardTitle>
            <CardDescription>
              Manage what actions you can perform with your LinkedIn account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Create Posts</p>
                  <p className="text-sm text-muted-foreground">Schedule and publish new posts</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Access post performance data</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Manage Comments</p>
                  <p className="text-sm text-muted-foreground">Respond to post comments</p>
                </div>
                <Badge variant="secondary">Limited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection History */}
      {isConnected && oauthData && (
        <Card>
          <CardHeader>
            <CardTitle>Connection History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Connected</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(oauthData.connectedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">Current</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 