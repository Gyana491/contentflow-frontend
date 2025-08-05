"use client"

import { PostsList } from "@/components/posts-list"

export default function PostsPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all your published and scheduled LinkedIn posts
          </p>
        </div>
        <PostsList />
      </div>
    </div>
  )
} 