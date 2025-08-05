"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, TrendingUp, Newspaper, BookOpen, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { DatabasePost } from "@/hooks/use-posts"
import { LinkedInPreview } from "@/components/linkedin-preview"
import { useAuthStore } from "@/lib/auth-store"

interface PostDetailDialogProps {
  post: DatabasePost | null
  isOpen: boolean
  onClose: () => void
}

export function PostDetailDialog({ post, isOpen, onClose }: PostDetailDialogProps) {
  const { user } = useAuthStore()

  if (!post) return null

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      case 'news':
        return <Newspaper className="h-4 w-4" />
      case 'tutorial':
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>
    }
    
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Scheduled</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Function to extract LinkedIn post ID from linkedInUrl or linkedInPostId
  const getLinkedInPostId = () => {
    if (post.linkedInPostId) {
      return post.linkedInPostId
    }
    if (post.linkedInUrl) {
      // Extract post ID from URL like: https://www.linkedin.com/feed/update/urn:li:share:7358310561341714432/
      const match = post.linkedInUrl.match(/urn:li:share:([^\/]+)/)
      return match ? `urn:li:share:${match[1]}` : null
    }
    return null
  }

  const linkedInPostId = getLinkedInPostId()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Post Details</DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(post.status, post.isPublished)}
              {post.linkedInUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(post.linkedInUrl!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on LinkedIn
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2">
              {getContentTypeIcon(post.contentType)}
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{post.contentType.toLowerCase()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Tone</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{post.tone.toLowerCase()}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {post.scheduledPost && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Scheduled</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {format(new Date(post.scheduledPost.scheduledAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Post Content */}
          <div>
            <h3 className="text-sm font-medium mb-2">Content</h3>
            {post.isPublished && linkedInPostId ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe 
                  src={`https://www.linkedin.com/embed/feed/update/${linkedInPostId}`}
                  height="600"
                  width="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="Embedded LinkedIn post"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <LinkedInPreview
                  content={post.content}
                  imageUrl={
                    post.imageAssetUrn
                      ? (() => {
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL
                          const imageUrl = `${apiUrl}/posts/image/${encodeURIComponent(post.imageAssetUrn)}`
                          return imageUrl
                        })()
                      : post.imageUrl || undefined
                  }
                  profile={{
                    firstName: user && user.firstName ? user.firstName : undefined,
                    lastName: user && user.lastName ? user.lastName : undefined,
                    name: user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined
                  }}
                  onCopy={(text) => {
                    navigator.clipboard.writeText(text)
                  }}
                  copied={false}
                  isPlaceholder={false}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 