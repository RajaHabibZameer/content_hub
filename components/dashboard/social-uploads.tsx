'use client';

import useSWR from 'swr';
import { RefreshCw, ExternalLink, Clock, Calendar, AlertCircle, ImageOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type SocialUpload = {
  id: string;
  product_name: string;
  content_type: string;
  preview_url: string;
  captions?: string;
  hashtags?: string;
  status: string;
  scheduled_time?: string;
  posted_at?: string;
  platform?: string;
};

export function SocialUploads() {
  const { data, error, isLoading, mutate } = useSWR<{ uploads: SocialUpload[], error?: string }>(
    '/api/social',
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  const uploads = data?.uploads || [];
  const hasError = error || data?.error;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner width={40} height={40} />
          <p className="text-muted-foreground">Loading social uploads...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><AlertCircle className="h-8 w-8 text-destructive" /></EmptyMedia>
            <EmptyTitle>Failed to load uploads</EmptyTitle>
            <EmptyDescription>{hasError}</EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => mutate()} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </Empty>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><ImageOff className="h-8 w-8" /></EmptyMedia>
          <EmptyTitle>No Social Uploads Yet</EmptyTitle>
          <EmptyDescription>Uploaded or scheduled posts will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Uploads</h1>
          <p className="text-muted-foreground">
            All posts sent to social media • Showing {uploads.length} uploads from "Generated Post" sheet
          </p>
        </div>
        <Button onClick={() => mutate()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {uploads.map((upload) => {
          const isVideo = upload.preview_url?.toLowerCase().endsWith('.mp4') || 
                         upload.content_type?.toLowerCase().includes('video');

          return (
            <div key={upload.id} className="rounded-2xl border bg-card overflow-hidden flex flex-col h-full hover:shadow-md transition-all">

              {/* Media Preview */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden flex-shrink-0">
                {upload.preview_url ? (
                  isVideo ? (
                    <video 
                      src={upload.preview_url} 
                      controls 
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <img 
                      src={upload.preview_url} 
                      alt={upload.product_name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex h-full items-center justify-center bg-zinc-900">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16V4a2 2 0 01-2-2H6a2 2 0 01-2 2v12a2 2 0 01-2 2z" />
                              </svg>
                            </div>`;
                        }
                      }}
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-900">
                    <ImageOff className="h-12 w-12 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1 pr-2">
                    {upload.product_name}
                  </h3>
                  <Badge variant={upload.status?.toLowerCase() === 'posted' ? "default" : "secondary"}>
                    {upload.status || 'Ready'}
                  </Badge>
                </div>

                <Badge variant="outline" className="self-start mb-4 text-xs">
                  {upload.content_type?.toUpperCase() || 'UGC'}
                </Badge>

                {/* Captions - Prominently shown */}
                {upload.captions && (
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                    {upload.captions}
                  </p>
                )}

                {/* Hashtags */}
                {upload.hashtags && (
                  <div className="text-xs text-emerald-600 mb-5 break-words">
                    {upload.hashtags}
                  </div>
                )}

                {/* Time Information */}
                <div className="mt-auto space-y-2 text-xs text-muted-foreground">
                  {upload.scheduled_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Scheduled: {new Date(upload.scheduled_time).toLocaleString()}
                    </div>
                  )}
                  {upload.posted_at && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Calendar className="h-4 w-4" />
                      Posted: {new Date(upload.posted_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* View Button - Always visible at bottom */}
              {upload.preview_url && (
                <div className="p-4 pt-0 border-t mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 h-11 "
                    asChild
                  >
                    <a 
                      href={upload.preview_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 " />
                      View Video
                    </a>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}