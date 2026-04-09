'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Upload, Play, ImageOff, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { type GeneratedContent } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface ContentCardProps {
  content: GeneratedContent
  onUpload: (content: GeneratedContent, scheduledDateTime: string) => void
  isUploading: boolean
  isSelected: boolean
  onToggleSelect: (content: GeneratedContent) => void
}

export function ContentCard({ 
  content, 
  onUpload, 
  isUploading, 
  isSelected, 
  onToggleSelect 
}: ContentCardProps) {
  const [showDateTime, setShowDateTime] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  const status = content.status || 'Unknown'

  const isVideo = content.content_type === 'ugc' || content.content_type === 'cgi' || 
                  content.content_type === 'ugc_cgi' || content.link.toLowerCase().endsWith('.mp4')

  const hashtagsArray = content.hashtag 
    ? content.hashtag.trim().split(/\s+/).filter(tag => tag.startsWith('#'))
    : []

  const hasValidLink = !!content.link && content.link.trim() !== ''

  const handleUploadClick = () => {
    setShowDateTime(true)
    setScheduledDateTime('')
  }

  const handlePost = () => {
    if (!scheduledDateTime) return
    const isoTime = new Date(scheduledDateTime).toISOString()
    onUpload(content, isoTime)
    setShowDateTime(false)
    setScheduledDateTime('')
  }

  const handleCancel = () => {
    setShowDateTime(false)
    setScheduledDateTime('')
  }

  return (
    <Card className={cn(
      "overflow-hidden border transition-all flex flex-col h-full",
      isSelected && "border-primary ring-1 ring-primary"
    )}>
      
      {/* Media Preview */}
      <div className="relative aspect-video bg-zinc-950 overflow-hidden flex-shrink-0">
        {hasValidLink ? (
          isVideo ? (
            <video src={content.link} controls className="h-full w-full object-cover" />
          ) : (
            <img src={content.link} alt={content.product_name} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900">
            <ImageOff className="h-12 w-12 text-zinc-600" />
          </div>
        )}

        {/* Multiple Selection Checkbox */}
        <div 
          className="absolute top-3 left-3 z-20 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onToggleSelect(content); }}
        >
          <div className={cn(
            "w-6 h-6 rounded border-2 flex items-center justify-center bg-white",
            isSelected ? "bg-primary border-primary" : "border-gray-400"
          )}>
            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
          </div>
        </div>
      </div>

      {/* Details */}
      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{content.product_name}</h3>
            <p className="text-emerald-500 text-sm">Generated</p>
          </div>
          <Badge variant="outline">{status}</Badge>
        </div>

        {content.caption && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{content.caption}</p>
        )}

        {hashtagsArray.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {hashtagsArray.map((tag, i) => (
              <a key={i} href={`https://www.instagram.com/explore/tags/${tag.replace('#','')}/`} target="_blank" className="text-blue-500 text-xs hover:underline">
                {tag}
              </a>
            ))}
          </div>
        )}
      </CardContent>

      {/* Individual Upload Section */}
      <CardFooter className="p-4 pt-0 mt-auto">
        {!showDateTime ? (
          <Button 
            onClick={handleUploadClick} 
            disabled={isUploading} 
            className="w-full h-12 gap-2" 
            size="lg"
          >
            <Upload className="h-5 w-5" />
            Upload to Social Media
          </Button>
        ) : (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Schedule for this item
            </div>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="w-full rounded-md border px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handlePost} disabled={!scheduledDateTime || isUploading} className="flex-1 gap-2">
                {isUploading ? <Spinner className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                Post
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}