'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Upload, Play, Link as LinkIcon, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type GeneratedContent } from '@/lib/mock-data'   // ya tumhara type jo export hai

interface ContentCardProps {
  content: GeneratedContent
  onUpload: (content: GeneratedContent) => void
  isUploading: boolean
}

export function ContentCard({ content, onUpload, isUploading }: ContentCardProps) {
  const status = content.status || 'Unknown'

  // Video detection
  const isVideo = content.content_type === 'ugc' || 
                  content.content_type === 'cgi' || 
                  content.content_type === 'ugc_cgi' ||
                  content.link.toLowerCase().endsWith('.mp4') ||
                  content.link.includes('/v/')

  const hashtagsArray = content.hashtag 
    ? content.hashtag.trim().split(/\s+/).filter(tag => tag.startsWith('#'))
    : []

  const hasValidLink = !!content.link && content.link.trim() !== ''

  return (
    <Card className="overflow-hidden border border-border/50 hover:border-border transition-all flex flex-col h-full">
      
      {/* Media Preview */}
      <div className="relative aspect-video bg-zinc-950 overflow-hidden flex-shrink-0">
        {hasValidLink ? (
          isVideo ? (
            <video
              src={content.link}
              controls
              className="h-full w-full object-cover"
              onError={() => console.error("Video failed:", content.link)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={content.link}
              alt={content.product_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error("Image failed:", content.link)
                e.currentTarget.style.display = 'none'
              }}
            />
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-zinc-900">
            <ImageOff className="h-12 w-12 text-zinc-600 mb-3" />
            <p className="text-zinc-400 text-sm">Preview not available</p>
          </div>
        )}

        {isVideo && hasValidLink && (
          <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded text-white text-xs flex items-center gap-1">
            <Play className="h-3.5 w-3.5" /> VIDEO
          </div>
        )}
      </div>

      {/* Content Details */}
      <CardContent className="p-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {content.product_name}
            </h3>
            <p className="text-emerald-500 text-sm">Generated</p>
          </div>

          {/* Simple Status Badge - Direct from Google Sheet */}
          <Badge variant="outline" className="shrink-0 font-medium">
            {status}
          </Badge>
        </div>

        {content.caption && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {content.caption}
          </p>
        )}

        {/* Hashtags */}
        {hashtagsArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hashtagsArray.map((tag, index) => (
              <a
                key={index}
                href={`https://www.instagram.com/explore/tags/${tag.replace('#', '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-xs font-medium"
              >
                {tag}
              </a>
            ))}
          </div>
        )}

        {(content.variation || content.version) && (
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            {content.variation && <p>Variation: <span className="text-foreground">{content.variation}</span></p>}
            {content.version && <p>Version: <span className="text-foreground">{content.version}</span></p>}
          </div>
        )}
      </CardContent>

      {/* Upload Button - Hamesha Show Hoga */}
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          onClick={() => onUpload(content)}
          disabled={isUploading}
          className="w-full h-12 gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          size="lg"
        >
          {isUploading ? (
            <>
              <Spinner className="h-4 w-4" />
              Uploading to Social Media...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Upload to Social Media
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}