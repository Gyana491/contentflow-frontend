"use client"

import { useState, useRef, useEffect } from 'react'
import { 
  Linkedin, 
  Copy, 
  Check, 
  ThumbsUp, 
  MessageCircle, 
  Repeat, 
  Send, 
  Image as ImageIcon,
  X
} from 'lucide-react'

interface LinkedInPreviewProps {
  content: string
  imageUrl?: string
  imageFile?: File
  profile?: {
    firstName?: string
    lastName?: string
    name?: string
    headline?: string
    id?: string
    profilePicture?: string
    vanityName?: string
    industry?: string
    location?: string
    email?: string
    emailVerified?: boolean
    locale?: string
  }
  onCopy?: (text: string) => void
  onImageRemove?: () => void
  isLoading?: boolean
  isPlaceholder?: boolean
  isOverLimit?: boolean
  copied?: boolean
  maxCharacters?: number
}

export function LinkedInPreview({
  content,
  imageUrl,
  imageFile,
  profile,
  onCopy,
  onImageRemove,
  isLoading = false,
  isPlaceholder = false,
  isOverLimit = false,
  copied = false,
  maxCharacters = 3000
}: LinkedInPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const characterCount = content.length

  // Function to check if content exceeds 2 lines
  const checkIfContentExceeds = (content: string) => {
    if (!content) return false
    const lines = content.split('\n')
    return lines.length > 2
  }

  const shouldShowMore = checkIfContentExceeds(content)

  const handleCopy = () => {
    if (onCopy) {
      onCopy(content)
    } else {
      navigator.clipboard.writeText(content).catch(console.error)
    }
  }

  const handleImageRemove = () => {
    console.log('Image remove clicked, onImageRemove function:', !!onImageRemove)
    if (onImageRemove) {
      onImageRemove()
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 w-full shadow-sm ${isOverLimit ? 'border-red-300' : ''} ${isLoading ? 'animate-pulse' : ''} ${isPlaceholder ? 'opacity-75' : ''}`}>
      {/* LinkedIn Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
          {profile?.profilePicture ? (
            <>
              <img 
                src={profile.profilePicture} 
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <span className="text-white font-semibold text-lg hidden">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            </>
          ) : profile ? (
            <span className="text-white font-semibold text-lg">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </span>
          ) : (
            <Linkedin className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {profile ? (profile.name || `${profile.firstName} ${profile.lastName}`) : 'Your Name'}
          </div>
          <div className="text-sm text-gray-500">
            {profile?.headline || 'LinkedIn Member'} • 1st
          </div>
          <div className="text-sm text-gray-500">
            Just now • 🌐
            {profile?.location && ` • ${profile.location}`}
          </div>
        </div>
        {!isLoading && !isPlaceholder && (
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy post content"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="flex flex-col mb-4 relative">
        {/* Content with read more/less - native LinkedIn style */}
        <div 
          className={`leading-relaxed whitespace-pre-wrap font-sans text-gray-900 transition-colors ${
            isOverLimit ? 'text-red-600' : ''
          }`}
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            lineHeight: '1.4',
            padding: '4px',
            margin: '-4px'
          }}
        >
          {isExpanded ? (
            content
          ) : (
            <>
              {shouldShowMore ? (
                <>
                  {content.split('\n').slice(0, 2).map((line, index) => (
                    <span key={index}>
                      {line}
                      {index === 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium ml-1 cursor-pointer"
                        >
                          ...more
                        </button>
                      )}
                      {index < 1 && '\n'}
                    </span>
                  ))}
                </>
              ) : (
                content
              )}
            </>
          )}
        </div>
        
        {/* Show Less Button (only when expanded) */}
        {isExpanded && shouldShowMore && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 self-start"
          >
            Show less
          </button>
        )}
      </div>

      {/* Image Preview - LinkedIn Style */}
      {imageUrl && (
        <>
          {console.log('Rendering image preview, imageUrl:', imageUrl, 'onImageRemove:', !!onImageRemove)}
        <div className="mb-4 relative">
          <div className="w-full rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={imageUrl} 
              alt="Post image" 
              className="w-full h-auto max-h-96 object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden w-full h-48 bg-gray-100">
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Remove Image Button */}
          {onImageRemove && (
            <button
              onClick={handleImageRemove}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        </>
      )}

      {/* Character Count */}
      <div className="text-xs text-gray-500 mb-3">
        {characterCount}/{maxCharacters} characters
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-sm border-t pt-3">
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-xs">
            <ThumbsUp className="inline h-3 w-3 mr-1" />
            0
          </span>
          <span className="text-gray-500 text-xs">
            <MessageCircle className="inline h-3 w-3 mr-1" />
            0
          </span>
          <span className="text-gray-500 text-xs">
            <Repeat className="inline h-3 w-3 mr-1" />
            0
          </span>
        </div>
        <span className="text-gray-500 text-xs">
          <Send className="inline h-3 w-3 mr-1" />
          0
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-3 mt-2">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <ThumbsUp className="h-4 w-4" />
          Like
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <Repeat className="h-4 w-4" />
          Repost
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </div>
  )
} 