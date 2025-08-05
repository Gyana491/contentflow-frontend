"use client"

import { useState } from 'react'
import { useLinkedInOAuth } from "@/hooks/use-linkedin-oauth"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LinkedInPreview } from '@/components/linkedin-preview'
import { 
  Smile,
  Calendar,
  Settings,
  Plus,
  Clock,
  Image as ImageIcon
} from 'lucide-react'

interface PostData {
  content: string
  imageUrl?: string
  imageFile?: File
}

export function LinkedInPostEditor() {
  const { oauthData, getAccessToken } = useLinkedInOAuth()
  const [postData, setPostData] = useState<PostData>({
    content: '',
  })
  const [imageInput, setImageInput] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setPostData(prev => ({
        ...prev,
        imageUrl: imageInput.trim()
      }))
      setImageInput('')
    }
  }

  const handleRemoveImage = () => {
    setPostData(prev => ({
      ...prev,
      imageUrl: undefined,
      imageFile: undefined
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a preview URL for the uploaded file
      const imageUrl = URL.createObjectURL(file)
      setPostData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: imageUrl
      }))
    }
  }

  const handlePublish = async () => {
    if (!postData.content.trim()) {
      alert('Please enter some content for your post')
      return
    }

    setIsPublishing(true)

    try {
      if (!oauthData?.linkedInAuthId) {
        throw new Error('No LinkedIn connection available')
      }

      // Create the post using our backend API route (supports both text and image)
      const formData = new FormData()
      formData.append('linkedInAuthId', oauthData.linkedInAuthId)
      formData.append('content', postData.content)
      
      if (postData.imageFile) {
        formData.append('imageFile', postData.imageFile)
      }

      const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/linkedin/publish-with-image`, {
        method: 'POST',
        body: formData,
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        throw new Error(errorData.error || 'Failed to publish post')
      }

      const result = await publishResponse.json()
      console.log('Post published successfully:', result)
      
      // Clear the form after successful publish
      setPostData({ content: '' })
      
      // Show success message
      const message = result.hasImage 
        ? 'Post with image published successfully to LinkedIn!' 
        : 'Post published successfully to LinkedIn!'
      alert(message)
      
    } catch (error) {
      console.error('Publishing error:', error)
      alert(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postData.content)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const characterCount = postData.content.length
  const maxCharacters = 3000
  const isOverLimit = characterCount > maxCharacters

  return (
    <div className="space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Side - Simple Editor */}
        <div className="flex flex-col">
          <Card>
            <CardContent className="flex flex-col p-6">
                             {/* Simple Text Input */}
               <div className="flex-1 flex flex-col">
                 <Textarea
                   placeholder="What do you want to talk about?"
                   value={postData.content}
                   onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                   className="flex-1 resize-none border-none outline-none text-lg leading-relaxed p-0 overflow-y-auto"
                   maxLength={maxCharacters}
                   style={{
                     minHeight: '200px',
                     maxHeight: '400px',
                     fontSize: '16px',
                     lineHeight: '1.6'
                   }}
                 />
                
                {/* Character Count */}
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span className={isOverLimit ? 'text-red-600' : ''}>
                    {characterCount}/{maxCharacters}
                  </span>
                  {isOverLimit && (
                    <span className="text-red-600 text-xs">
                      Exceeds LinkedIn limit
                    </span>
                  )}
                </div>
              </div>

              {/* Action Icons Row */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Smile className="h-5 w-5" />
                  </button>
                  
                  <label className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <ImageIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Calendar className="h-5 w-5" />
                  </button>
                  
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Post Button */}
                <Button 
                  onClick={handlePublish}
                  disabled={!postData.content.trim() || isOverLimit || isPublishing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                >
                  {isPublishing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publishing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Post
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

                                   {/* Right Side - Live Preview */}
          <div className="flex flex-col">
            <LinkedInPreview 
              content={postData.content}
              imageUrl={postData.imageUrl}
              imageFile={postData.imageFile}
              profile={oauthData?.profile}
              onCopy={handleCopy}
              onImageRemove={handleRemoveImage}
              isOverLimit={isOverLimit}
              maxCharacters={maxCharacters}
            />
          </div>
      </div>
    </div>
  )
}

 