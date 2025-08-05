"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, FileText, TrendingUp, Newspaper, BookOpen, User, ThumbsUp, MessageCircle, Repeat, Edit, Trash2, Plus, Save, X, Filter, Search, ArrowRight, Copy, Send, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/lib/auth-store';
import { LinkedInPreview } from '@/components/linkedin-preview';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePosts, DatabasePost } from '@/hooks/use-posts';
import { usePostCounts } from '@/hooks/use-post-counts';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';

interface FilterState {
  status: string
  contentType: string
  dateFrom: string
  dateTo: string
  search: string
}

interface PostsListProps {
  className?: string;
  defaultFilter?: 'draft' | 'scheduled' | 'published';
}

export function PostsList({ className, defaultFilter }: PostsListProps) {
  const { isAuthenticated, token, user } = useAuthStore();
  const { posts: databasePosts, isLoading, error, fetchPosts, updatePost, deletePost } = usePosts();
  const { fetchCounts } = usePostCounts();
  const [editingPost, setEditingPost] = useState<DatabasePost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: defaultFilter || "all",
    contentType: "all",
    dateFrom: "",
    dateTo: "",
    search: ""
  });
  const [editForm, setEditForm] = useState({
    content: '',
    scheduledDate: null as Date | null,
    scheduledTime: ''
  });

  // Filter posts based on current filters
  const filteredPosts = useMemo(() => {
    return databasePosts.filter((post) => {
      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "published" && !post.isPublished) return false
        if (filters.status === "draft" && post.isPublished) return false
        if (filters.status === "scheduled" && post.status.toLowerCase() !== "scheduled") return false
      }

      // Content type filter
      if (filters.contentType !== "all" && post.contentType.toLowerCase() !== filters.contentType.toLowerCase()) {
        return false
      }

      // Date range filter
      if (filters.dateFrom) {
        const postDate = new Date(post.createdAt)
        const fromDate = new Date(filters.dateFrom)
        if (postDate < fromDate) return false
      }

      if (filters.dateTo) {
        const postDate = new Date(post.createdAt)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        if (postDate > toDate) return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const contentMatch = post.content.toLowerCase().includes(searchLower)
        const titleMatch = post.title?.toLowerCase().includes(searchLower) || false
        const hashtagMatch = post.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!contentMatch && !titleMatch && !hashtagMatch) return false
      }

      return true
    })
  }, [databasePosts, filters])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      contentType: "all",
      dateFrom: "",
      dateTo: "",
      search: ""
    })
  }

  const hasActiveFilters = filters.status !== "all" || 
                          filters.contentType !== "all" || 
                          filters.dateFrom || 
                          filters.dateTo || 
                          filters.search

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v !== "all" && v !== "").length
  }

  // Auto-open filters when defaultFilter is provided
  useEffect(() => {
    if (defaultFilter) {
      setIsFilterOpen(true);
    }
  }, [defaultFilter]);

  // Refresh post counts when posts are fetched
  useEffect(() => {
    if (databasePosts.length > 0 || !isLoading) {
      fetchCounts();
    }
  }, [databasePosts.length, isLoading, fetchCounts]);

  // CRUD Operations
  const handleEdit = (post: DatabasePost) => {
    setEditingPost(post);
    setEditForm({
      content: post.content,
      scheduledDate: post.scheduledPost ? new Date(post.scheduledPost.scheduledAt) : null,
      scheduledTime: post.scheduledPost ? new Date(post.scheduledPost.scheduledAt).toTimeString().slice(0, 5) : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setIsEditDialogOpen(false);
    setEditForm({
      content: '',
      scheduledDate: null,
      scheduledTime: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const updateData: { content: string } = {
        content: editForm.content
      };

      // Handle scheduling if date and time are set
      if (editForm.scheduledDate && editForm.scheduledTime) {
        const scheduledDateTime = new Date(editForm.scheduledDate);
        const [hours, minutes] = editForm.scheduledTime.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        
        // Update the scheduled post
        if (editingPost.scheduledPost) {
          // Update existing scheduled post
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scheduled-posts/${editingPost.scheduledPost.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scheduledAt: scheduledDateTime.toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }),
          });
        } else {
          // Create new scheduled post
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/schedule`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postId: editingPost.id,
              scheduledAt: scheduledDateTime.toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
          });
        }
      }

      const updatedPost = await updatePost(editingPost.id, updateData);
      
      if (updatedPost) {
        setEditingPost(null);
        setIsEditDialogOpen(false);
        setEditForm({
          content: '',
          scheduledDate: null,
          scheduledTime: ''
        });
        // Refresh post counts
        fetchCounts();
      } else {
        alert('Failed to update post. Please try again.');
      }
    } catch (error) {
      console.error('Update post error:', error);
      alert(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deletePost(postId);
      
      if (success) {
        // Refresh post counts
        fetchCounts();
      } else {
        alert('Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Delete post error:', error);
      alert(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleContinueEditing = (post: DatabasePost) => {
    // Store the post data in localStorage for the content generation form to pick up
    const draftData = {
      id: post.id,
      content: post.content,
      title: post.title,
      hashtags: post.hashtags,
      contentType: post.contentType,
      tone: post.tone,
      isDraft: true
    };
    
    localStorage.setItem('continueEditingDraft', JSON.stringify(draftData));
    
    // Navigate to the create page
    window.location.href = '/dashboard/create';
  };

  const handleDuplicateDraft = (post: DatabasePost) => {
    // Store the post data in localStorage for the content generation form to pick up (without ID)
    const draftData = {
      content: post.content,
      title: post.title ? `${post.title} (Copy)` : null,
      hashtags: post.hashtags,
      contentType: post.contentType,
      tone: post.tone,
      isDraft: true
    };
    
    localStorage.setItem('continueEditingDraft', JSON.stringify(draftData));
    
    // Navigate to the create page
    window.location.href = '/dashboard/create';
  };

  const handlePublishDraft = async (post: DatabasePost) => {
    if (!confirm('Are you sure you want to publish this draft to LinkedIn?')) {
      return;
    }

    try {
      // For now, we'll redirect to the create page with the draft data to publish
      // This allows users to review and make final edits before publishing
      const draftData = {
        id: post.id,
        content: post.content,
        title: post.title,
        hashtags: post.hashtags,
        contentType: post.contentType,
        tone: post.tone,
        isDraft: true,
        publishOnLoad: true
      };
      
      localStorage.setItem('continueEditingDraft', JSON.stringify(draftData));
      
      // Navigate to the create page
      window.location.href = '/dashboard/create';
    } catch (error) {
      console.error('Publish draft error:', error);
      alert(`Failed to prepare draft for publishing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'news':
        return <Newspaper className="h-4 w-4" />;
      case 'tutorial':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const LinkedInPreviewCard = ({ post }: { post: DatabasePost }) => {
    // Function to extract LinkedIn post ID from linkedInUrl or linkedInPostId
    const getLinkedInPostId = () => {
      if (post.linkedInPostId) {
        return post.linkedInPostId;
      }
      if (post.linkedInUrl) {
        // Extract post ID from URL like: https://www.linkedin.com/feed/update/urn:li:share:7358310561341714432/
        const match = post.linkedInUrl.match(/urn:li:share:([^\/]+)/);
        return match ? `urn:li:share:${match[1]}` : null;
      }
      return null;
    };

    const linkedInPostId = getLinkedInPostId();

    return (
    <>
      <Card className="h-full flex flex-col">
        {/* Card Header with Status and Actions */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(post.status, post.isPublished)}
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                {getContentTypeIcon(post.contentType)}
                <span className="capitalize">{post.contentType.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize">{post.tone.toLowerCase()}</span>
              </div>
            </div>
            
            {/* Action buttons row */}
            <div className="flex items-center gap-1">
              {!post.isPublished && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="h-8 w-8 p-0"
                    title="Edit Post"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleContinueEditing(post)}
                    className="h-8 w-8 p-0"
                    title="Continue Editing"
                  >
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateDraft(post)}
                    className="h-8 w-8 p-0"
                    title="Duplicate Draft"
                  >
                    <Copy className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublishDraft(post)}
                    className="h-8 w-8 p-0"
                    title="Publish Draft"
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="h-8 w-8 p-0"
                    title="Delete Post"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
              
              {/* External link for published posts */}
              {post.linkedInUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(post.linkedInUrl!, '_blank')}
                  className="h-8 w-8 p-0"
                  title="View on LinkedIn"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content container */}
        <CardContent className="p-0 flex-1">
          {/* Post content: embed or preview */}
          {post.isPublished && linkedInPostId ? (
            <iframe 
              src={`https://www.linkedin.com/embed/feed/update/${linkedInPostId}`}
              height="600"
              width="100%"
              frameBorder="0"
              allowFullScreen
              title="Embedded LinkedIn post"
              className="w-full"
            />
          ) : (
            <LinkedInPreview
              content={post.content}
              imageUrl={
                post.imageAssetUrn
                  ? (() => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                      const imageUrl = `${apiUrl}/posts/image/${encodeURIComponent(post.imageAssetUrn)}`;
                      console.log('Constructed image URL:', imageUrl);
                      console.log('Post imageAssetUrn:', post.imageAssetUrn);
                      return imageUrl;
                    })()
                  : post.imageUrl || undefined
              }
              profile={{
                firstName: user && user.firstName ? user.firstName : undefined,
                lastName: user && user.lastName ? user.lastName : undefined,
                name: user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined
              }}
              onCopy={(text) => {
                navigator.clipboard.writeText(text);
                // You could add a toast notification here
              }}
              copied={false}
              isPlaceholder={false}
            />
          )}
        </CardContent>

        {/* Card Footer with metadata */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
            <div className="flex flex-wrap gap-4">
              <span>Created {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
              {post.publishedAt && (
                <span>• Published {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
              )}
              {post.scheduledPost && (
                <span>• Scheduled {format(new Date(post.scheduledPost.scheduledAt), 'MMM d, yyyy HH:mm')}</span>
              )}
              {post.status.toLowerCase() === 'draft' && post.updatedAt !== post.createdAt && (
                <span>• Modified {format(new Date(post.updatedAt), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post content and scheduling
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter post content..."
                rows={8}
                className="resize-none"
              />
            </div>
            {/* Scheduling */}
            <div className="space-y-2">
              <Label>Scheduling</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editForm.scheduledDate
                          ? format(editForm.scheduledDate as Date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editForm.scheduledDate || undefined}
                        onSelect={(date) =>
                          setEditForm(prev => ({
                            ...prev,
                            scheduledDate: date ?? null,
                          }))
                        }
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selectedDate = new Date(date);
                          selectedDate.setHours(0, 0, 0, 0);
                          return selectedDate < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={editForm.scheduledTime}
                    onChange={(e) =>
                      setEditForm(prev => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              {editForm.scheduledDate && editForm.scheduledTime && (
                <p className="text-xs text-gray-500">
                  {(() => {
                    if (!editForm.scheduledDate) return null;
                    const scheduledDateTime = new Date(editForm.scheduledDate as Date);
                    const [hours, minutes] = editForm.scheduledTime
                      .split(":")
                      .map(Number);
                    scheduledDateTime.setHours(hours, minutes, 0, 0);
                    const now = new Date();
                    return scheduledDateTime > now
                      ? "✅ Valid schedule time"
                      : "⚠️ Please select a future time";
                  })()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )};

  // Main component return
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view your posts.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Error Loading Posts
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchPosts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content-type-filter">Content Type</Label>
              <Select value={filters.contentType} onValueChange={(value) => handleFilterChange('contentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="trend">Trend</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {hasActiveFilters ? 'No posts match your filters' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or clear them to see all posts.'
                : 'Create your first post to get started with content generation.'
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => window.location.href = '/dashboard/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <LinkedInPreviewCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}