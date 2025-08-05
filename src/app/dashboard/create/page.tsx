"use client"

import { ContentGenerationForm } from "@/components/content-generation-form"

export default function CreatePost() {
  return (
    <div className="min-h-[calc(100vh-200px)] p-4 space-y-6">
      <ContentGenerationForm />
    </div>
  )
}
