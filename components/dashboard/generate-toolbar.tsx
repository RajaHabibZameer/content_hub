'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { X, Video, Film, Layers, Image, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GenerateToolbarProps {
  selectedCount: number
  onClear: () => void
  onGenerate: (contentType: 'ugc' | 'cgi' | 'ugc_cgi' | 'image' | 'both') => void
  isGenerating: boolean
}

export function GenerateToolbar({ 
  selectedCount, 
  onClear, 
  onGenerate, 
  isGenerating 
}: GenerateToolbarProps) {
  
  if (selectedCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClear} 
            disabled={isGenerating}
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('ugc')}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            UGC
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('cgi')}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Film className="h-4 w-4" />}
            CGI
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('ugc_cgi')}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
            UGC+CGI
          </Button>

          {/* New Both Button - Highlighted */}
          <Button
            onClick={() => onGenerate('both')}
            disabled={isGenerating}
            variant="default"
            className="gap-2 font-semibold shadow-sm"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Both (UGC + CGI)
          </Button>

          <Button
            size="sm"
            onClick={() => onGenerate('image')}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Image className="h-4 w-4" />}
            Image
          </Button>
        </div>
      </div>
    </div>
  )
}