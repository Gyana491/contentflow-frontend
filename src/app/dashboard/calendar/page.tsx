"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, Filter, X, Search } from "lucide-react"
import { usePosts, DatabasePost } from "@/hooks/use-posts"
import { PostDetailDialog } from "@/components/post-detail-dialog"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FilterState {
  status: string
  contentType: string
  dateFrom: string
  dateTo: string
  search: string
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPost, setSelectedPost] = useState<DatabasePost | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    contentType: "all",
    dateFrom: "",
    dateTo: "",
    search: ""
  })

  const { posts, isLoading, error } = usePosts()

  // Filter posts based on current filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
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
  }, [posts, filters])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getPostsForDate = (date: Date | null) => {
    if (!date) return []
    
    return filteredPosts.filter((post) => {
      const postDate = new Date(post.createdAt)
      return postDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handlePostClick = (post: DatabasePost) => {
    setSelectedPost(post)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedPost(null)
  }

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

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get upcoming posts (next 7 days) from filtered posts
  const upcomingPosts = filteredPosts.filter((post) => {
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const postDate = new Date(post.createdAt)
    return postDate >= today && postDate <= weekFromNow
  }).slice(0, 5) // Limit to 5 posts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold">Content Calendar</span>
          </div>
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Posts</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search in content, title, or hashtags..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Type Filter */}
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={filters.contentType} onValueChange={(value) => handleFilterChange("contentType", value)}>
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">From</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">To</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    />
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-500 border-t pt-3">
                  Showing {filteredPosts.length} of {posts.length} posts
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.status !== "all" && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Status: {filters.status}
                    </Badge>
                  )}
                  {filters.contentType !== "all" && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Type: {filters.contentType}
                    </Badge>
                  )}
                  {filters.dateFrom && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      From: {format(new Date(filters.dateFrom), 'MMM d, yyyy')}
                    </Badge>
                  )}
                  {filters.dateTo && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      To: {format(new Date(filters.dateTo), 'MMM d, yyyy')}
                    </Badge>
                  )}
                  {filters.search && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Search: &quot;{filters.search}&quot;
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-700 hover:text-blue-800">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const postsForDay = day ? getPostsForDate(day) : []
                  const isToday = day && day.toDateString() === new Date().toDateString()
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                        day ? "hover:bg-gray-50" : ""
                      } ${isToday ? "bg-blue-50 border-blue-200" : "border-gray-200"} ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {postsForDay.map((post) => (
                              <div 
                                key={post.id} 
                                className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePostClick(post)
                                }}
                                title={post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')}
                              >
                                {format(new Date(post.createdAt), 'HH:mm')} - {post.content.substring(0, 30)}...
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500">Error loading posts</p>
                </div>
              ) : upcomingPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent posts</p>
                </div>
              ) : (
                upcomingPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(post.createdAt), 'MMM d, HH:mm')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{post.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getPostsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getPostsForDate(selectedDate).map((post) => (
                      <div 
                        key={post.id} 
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handlePostClick(post)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">
                            {format(new Date(post.createdAt), 'HH:mm')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{post.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No posts for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Post Detail Dialog */}
      <PostDetailDialog
        post={selectedPost}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
