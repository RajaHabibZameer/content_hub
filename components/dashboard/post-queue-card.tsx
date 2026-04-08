'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Loader2, 
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react'
import type { QueueItem } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface PostQueueCardProps {
  item: QueueItem
  onRetry?: (item: QueueItem) => void
}

const statusConfig = {
  queued: {
    icon: Clock,
    label: 'Queued',
    color: 'bg-muted text-muted-foreground border-muted-foreground/20',
    showLoader: true,
  },
  generating: {
    icon: Loader2,
    label: 'Generating',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    showLoader: true,
  },
  generated: {
    icon: CheckCircle2,
    label: 'Generated',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    showLoader: false,
  },
}

export function PostQueueCard({ item, onRetry }: PostQueueCardProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [prevStatus, setPrevStatus] = useState(item.status)

  // Detect when status changes to 'generated'
  useEffect(() => {
    if (prevStatus !== 'generated' && item.status === 'generated') {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
    setPrevStatus(item.status)
  }, [item.status, prevStatus])

  const status = statusConfig[item.status] || statusConfig.queued
  const StatusIcon = status.icon
  const isLoading = item.status === 'queued' || item.status === 'generating'

  return (
    <Card className="overflow-hidden relative">
      {/* Loading line animation - moves from left to right */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-loading-line" />
        </div>
      )}

      {/* Success message overlay */}
      {showSuccessMessage && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-green-600 dark:text-green-400">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Content Generated Successfully!</span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Image column */}
        <div className="relative h-36 w-36 flex-shrink-0">
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50" />
        </div>
        
        <CardContent className="flex flex-1 flex-col justify-between p-4">
          {/* Header: Name and Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {item.product.name}
              </h3>
              
              {/* Details row: variation, aspectRatio */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {item.variation && (
                  <Badge variant="outline" className="text-xs">
                    {item.variation}
                  </Badge>
                )}
                {item.aspectRatio && (
                  <Badge variant="secondary" className="text-xs">
                    {item.aspectRatio}
                  </Badge>
                )}
                {item.version && (
                  <Badge variant="secondary" className="text-xs">
                    v{item.version}
                  </Badge>
                )}
              </div>

              {/* Idea */}
              {item.idea && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {item.idea}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <Badge className={cn("gap-1 flex-shrink-0 border", status.color)}>
              <StatusIcon className={cn("h-3 w-3", item.status === 'generating' && "animate-spin")} />
              {status.label}
            </Badge>
          </div>
          
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {new Date(item.created_at).toLocaleString()}
            </span>
            {item.status === 'queued' && onRetry && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 gap-1 text-xs"
                onClick={() => onRetry(item)}
              >
                <Send className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
