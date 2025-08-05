"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Linkedin, Settings, Bell, User, Shield, Trash2 } from "lucide-react"
import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"
import { useAuthStore } from "@/lib/auth-store"

export default function SettingsPage() {
  const { oauthData, isConnected } = useLinkedInOAuth()
  const { user } = useAuthStore()
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(isConnected)
  const [notifications, setNotifications] = useState({
    postPublished: true,
    scheduledReminder: true,
    engagementUpdates: false,
    weeklyReport: true,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">Settings</span>
        </div>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your main account details from the users table</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={user?.firstName || ""} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={user?.lastName || ""} 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ""} 
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" />
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">User ID</Label>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded">{user?.id || 'Not available'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email Verified</Label>
                      <p className="text-sm">{user?.emailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Account Created</Label>
                      <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Timezone</Label>
                      <p className="text-sm">{user?.timezone || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  LinkedIn Integration
                </CardTitle>
                <CardDescription>Manage your LinkedIn account connection and posting preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {oauthData?.profile?.profilePicture ? (
                      <img 
                        src={oauthData.profile.profilePicture} 
                        alt={`${oauthData.profile.firstName} ${oauthData.profile.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {oauthData?.profile?.firstName?.[0]}{oauthData?.profile?.lastName?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {oauthData?.profile?.firstName && oauthData?.profile?.lastName 
                          ? `${oauthData.profile.firstName} ${oauthData.profile.lastName}`
                          : "LinkedIn User"
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {oauthData?.profile?.headline || "LinkedIn Member"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Connected to: {user?.firstName} {user?.lastName} ({user?.email})
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600">Connected</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsLinkedInConnected(!isLinkedInConnected)}>
                    {isLinkedInConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>

                {isLinkedInConnected && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Posting Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Auto-add hashtags</p>
                          <p className="text-xs text-gray-500">Automatically add relevant hashtags to posts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Tag connections</p>
                          <p className="text-xs text-gray-500">Allow tagging LinkedIn connections in posts</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Post analytics</p>
                          <p className="text-xs text-gray-500">Track post performance and engagement</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Monitor your LinkedIn API usage and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Posts this month</span>
                      <span>24/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "24%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API calls today</span>
                      <span>156/1000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "15.6%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Post Published</p>
                      <p className="text-xs text-gray-500">Get notified when your posts are published</p>
                    </div>
                    <Switch
                      checked={notifications.postPublished}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, postPublished: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Scheduled Post Reminders</p>
                      <p className="text-xs text-gray-500">Reminders 1 hour before scheduled posts</p>
                    </div>
                    <Switch
                      checked={notifications.scheduledReminder}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, scheduledReminder: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Engagement Updates</p>
                      <p className="text-xs text-gray-500">Daily updates on likes, comments, and shares</p>
                    </div>
                    <Switch
                      checked={notifications.engagementUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, engagementUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weekly Reports</p>
                      <p className="text-xs text-gray-500">Weekly summary of your posting activity</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Pro Plan</h3>
                      <Badge>Active</Badge>
                    </div>
                    <p className="text-sm text-gray-500">$29/month • Renews on Jan 15, 2024</p>
                    <p className="text-xs text-gray-400 mt-1">
                      100 posts/month • Advanced analytics • Priority support
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that will affect your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-red-600">Delete Account</p>
                      <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
