'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  X,
  Video,
  Film,
  Layers,
  Image as ImageIcon,
  Copy,
  ChevronDown
} from 'lucide-react'

import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GenerateToolbarProps {
  selectedCount: number
  onClear: () => void
  onGenerate: (
    contentType: 'ugc' | 'cgi' | 'ugc_cgi' | 'image' | 'both',
    imageVariant?: 'product' | 'actor'
  ) => void
  isGenerating: boolean
}

export function GenerateToolbar({
  selectedCount,
  onClear,
  onGenerate,
  isGenerating
}: GenerateToolbarProps) {

  const [isImageOpen, setIsImageOpen] = useState(false)

  if (selectedCount === 0) return null

  const baseHover =
    "transition-colors hover:bg-green-500 hover:text-white dark:hover:bg-white dark:hover:text-black"

  const itemHover =
    "cursor-pointer transition-colors hover:bg-green-500 hover:text-white dark:hover:bg-white dark:hover:text-black"

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={isGenerating}
            className={baseHover}
          >
            <X className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          {/* UGC */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('ugc')}
            disabled={isGenerating}
            className={`gap-2 ${baseHover}`}
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            UGC
          </Button>

          {/* CGI */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('cgi')}
            disabled={isGenerating}
            className={`gap-2 ${baseHover}`}
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Film className="h-4 w-4" />}
            CGI
          </Button>

          {/* UGC + CGI */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate('ugc_cgi')}
            disabled={isGenerating}
            className={`gap-2 ${baseHover}`}
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
            UGC+CGI
          </Button>

          {/* BOTH */}
          <Button
            onClick={() => onGenerate('both')}
            disabled={isGenerating}
            variant="default"
            className={`gap-2 font-semibold shadow-sm ${baseHover}`}
          >
            {isGenerating ? <Spinner className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Both
          </Button>

          {/* IMAGE DROPDOWN */}
          <DropdownMenu open={isImageOpen} onOpenChange={setIsImageOpen}>

            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isGenerating}
                className={`gap-2 ${baseHover}`}
              >
                {isGenerating ? <Spinner className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                Image
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border bg-white dark:bg-zinc-900"
            >

              {/* PRODUCT IMAGE */}
              <DropdownMenuItem
                onClick={() => {
                  onGenerate('image', 'product')
                  setIsImageOpen(false)
                }}
                className={itemHover}
              >
                <ImageIcon className="h-4 w-4" />
                Product Showcase Image
              </DropdownMenuItem>

              {/* ACTOR IMAGE */}
              <DropdownMenuItem
                onClick={() => {
                  onGenerate('image', 'actor')
                  setIsImageOpen(false)
                }}
                className={itemHover}
              >
                <ImageIcon className="h-4 w-4" />
                Cinematic Model Scene
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </div>
  )
}