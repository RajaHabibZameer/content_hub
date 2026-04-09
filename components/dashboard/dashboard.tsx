'use client'

import { useState, useCallback, useMemo, useId, useEffect } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { ProductCard } from './product-card'
import { ContentCard } from './content-card'
import { PostQueueCard } from './post-queue-card'
import { StatsCards } from './stats-cards'
import { SettingsPage } from './settings-page'
import { GenerateToolbar } from './generate-toolbar'
import { SocialUploads } from './social-uploads'  // ← New Import

import { type Product, type GeneratedContent, type QueueItem } from '@/lib/mock-data'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Video, 
  ListTodo, 
  CheckSquare, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock 
} from 'lucide-react'

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

type TabType = 'dashboard' | 'products' | 'queue' | 'content' | 'settings' | 'library' | 'upload' 

// Global refresh interval - 30 seconds
const REFRESH_INTERVAL = 30000

export function Dashboard() {
  const instanceId = useId()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  
  // Products Selection
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  
  // Generated Content Selection (Bulk Actions)
  const [selectedContent, setSelectedContent] = useState<GeneratedContent[]>([])
  
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Bulk Scheduled Post State
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // SWR Data Fetching
  const { data: productsData, error: productsError, isLoading: productsLoading, mutate: mutateProducts } = useSWR<{ products: Product[], error?: string }>(
    '/api/products',
    fetcher,
    { 
      revalidateOnFocus: true, 
      dedupingInterval: 15000, 
      refreshInterval: REFRESH_INTERVAL,
      onSuccess: () => setLastRefresh(new Date())
    }
  )

  const { data: queueData, error: queueError, isLoading: queueLoading, mutate: mutateQueue } = useSWR<{ queue: QueueItem[] }>(
    '/api/queue',
    fetcher,
    { 
      revalidateOnFocus: true, 
      dedupingInterval: 15000, 
      refreshInterval: REFRESH_INTERVAL,
      onSuccess: () => setLastRefresh(new Date())
    }
  )

  const { 
    data: generatedData, 
    error: generatedError, 
    isLoading: generatedLoading, 
    mutate: mutateGenerated 
  } = useSWR<{ content: GeneratedContent[], error?: string }>(
    '/api/generated',
    fetcher,
    { 
      revalidateOnFocus: true, 
      dedupingInterval: 15000, 
      refreshInterval: REFRESH_INTERVAL,
      onSuccess: () => setLastRefresh(new Date())
    }
  )

  const products = productsData?.products || []
  const queueItems = queueData?.queue || []
  const generatedContent = generatedData?.content || []

  const fetchProductsError = productsData?.error || productsError?.message
  const fetchGeneratedError = generatedData?.error || generatedError?.message

  // Queue Stats
  const queuedCount = queueItems.filter(q => q.status === 'queued').length
  const generatingCount = queueItems.filter(q => q.status === 'generating').length
  const generatedCount = queueItems.filter(q => q.status === 'generated').length
  const pendingQueueCount = queuedCount + generatingCount

  const handleRefresh = useCallback(() => {
    mutateProducts()
    mutateQueue()
    mutateGenerated()
    setLastRefresh(new Date())
    toast.success('Data refreshed from Google Sheets')
  }, [mutateProducts, mutateQueue, mutateGenerated])

  // Products Filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  // Product Selection Handlers
  const handleToggleSelect = useCallback((product: Product) => {
    setSelectedProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts([...filteredProducts])
    }
  }, [selectedProducts.length, filteredProducts])

  const handleClearSelection = useCallback(() => {
    setSelectedProducts([])
  }, [])

  // Content Selection Handlers
  const handleToggleContentSelect = useCallback((content: GeneratedContent) => {
    setSelectedContent(prev =>
      prev.some(c => c.id === content.id)
        ? prev.filter(c => c.id !== content.id)
        : [...prev, content]
    )
  }, [])

  const handleClearContentSelection = useCallback(() => {
    setSelectedContent([])
    setScheduledDateTime('')
  }, [])

  // Generate Content (Products → n8n)
  const handleGenerate = useCallback(async (contentType: 'ugc' | 'cgi' | 'ugc_cgi' | 'image' |'both') => {
    if (selectedProducts.length === 0) return
    
    setIsGenerating(true)
    
    try {
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i]
        
        await fetch('https://louenlou.app.n8n.cloud/webhook/Post_Queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_name: product.name,
            description: product.description,
            image_url: product.image_url,
            category: product.category,
            content_type: contentType,
            queue_id: `${instanceId}-${Date.now()}-${i}-${contentType}`,
          }),
        })
      }
      
      toast.success(`${selectedProducts.length} product(s) sent for ${contentType.toUpperCase()} generation!`)
      setSelectedProducts([])
      setTimeout(() => mutateQueue(), 2000)
    } catch (error) {
      console.error('Failed to send to n8n:', error)
      toast.error('Failed to send to queue')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedProducts, instanceId, mutateQueue])

  // Bulk Scheduled Post
  const handleBulkScheduledPost = async () => {
    if (selectedContent.length === 0 || !scheduledDateTime) return

    const isoTime = new Date(scheduledDateTime).toISOString()

    try {
      for (const item of selectedContent) {
        await fetch('https://louenlou.app.n8n.cloud/webhook/post_scheduling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_id: item.id,
            product_name: item.product_name,
            content_type: item.content_type,
            preview_url: item.link,
            captions: item.caption,
            hashtags: item.hashtag,
            status: item.status,
            scheduled_time: isoTime,
          }),
        })
      }
      toast.success(`${selectedContent.length} items scheduled successfully!`)
      handleClearContentSelection()
      mutateGenerated()
    } catch {
      toast.error('Failed to schedule posts')
    }
  }

  // Bulk Post Now
  const handleBulkPostNow = async () => {
    if (selectedContent.length === 0) return

    const nowISO = new Date().toISOString()

    try {
      for (const item of selectedContent) {
        await fetch('https://louenlou.app.n8n.cloud/webhook/post_scheduling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_id: item.id,
            product_name: item.product_name,
            content_type: item.content_type,
            preview_url: item.link,
            captions: item.caption,
            hashtags: item.hashtag,
            status: item.status,
            scheduled_time: nowISO,
          }),
        })
      }
      toast.success(`${selectedContent.length} items posted now!`)
      handleClearContentSelection()
      mutateGenerated()
    } catch {
      toast.error('Failed to post now')
    }
  }

  // Single Content Upload
  const handleUploadToSocial = async (content: GeneratedContent, scheduledDateTime: string) => {
    setUploadingId(content.id)
    try {
      await fetch('https://louenlou.app.n8n.cloud/webhook/post_scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: content.id,
          product_name: content.product_name,
          content_type: content.content_type,
          preview_url: content.link,
          captions: content.caption,
          hashtags: content.hashtag,
          status: content.status,
          scheduled_time: scheduledDateTime,
        }),
      })
      toast.success(`Posted: ${content.product_name}`)
      mutateGenerated()
    } catch {
      toast.error('Failed to post')
    } finally {
      setUploadingId(null)
    }
  }

  const handleRetry = async (item: QueueItem) => {
    try {
      await fetch('https://louenlou.app.n8n.cloud/webhook/Post_Queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: item.product.name,
          description: item.product.description,
          image_url: item.product.image_url,
          category: item.product.category,
          content_type: item.content_type,
          queue_id: item.id,
        }),
      })
      await mutateQueue()
      toast.success('Retry sent to n8n')
    } catch {
      toast.error('Retry failed')
    }
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never'
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return lastRefresh.toLocaleTimeString()
  }

  // ==================== RENDER FUNCTIONS ====================

  const renderProductsGrid = () => {
    if (productsLoading) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner width={32} height={32} />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      )
    }

    if (fetchProductsError) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Failed to load products</EmptyTitle>
              <EmptyDescription>{fetchProductsError}</EmptyDescription>
            </EmptyHeader>
            <Button onClick={handleRefresh} variant="outline" className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </Empty>
        </div>
      )
    }

    if (products.length === 0) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Package className="h-6 w-6" /></EmptyMedia>
              <EmptyTitle>No products found</EmptyTitle>
              <EmptyDescription>Add products to your Google Sheet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Package className="h-6 w-6" /></EmptyMedia>
              <EmptyTitle>No matching products</EmptyTitle>
              <EmptyDescription>Try a different search.</EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setSearchQuery('')} variant="outline" className="mt-4">
              Clear Search
            </Button>
          </Empty>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {selectedProducts.length > 0 
              ? `${selectedProducts.length} of ${filteredProducts.length} selected`
              : `${filteredProducts.length} products`
            }
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="gap-2">
              <CheckSquare className="h-4 w-4" />
              {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProducts.some(p => p.id === product.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderQueueGrid = () => {
    if (queueLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner width={32} height={32} />
        </div>
      )
    }

    if (queueItems.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ListTodo className="h-6 w-6" /></EmptyMedia>
            <EmptyTitle>No items in queue yet</EmptyTitle>
            <EmptyDescription>Generate content from Products tab.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {queueItems.length} items in queue
            </p>
            <div className="flex gap-2">
              {queuedCount > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{queuedCount} Queued</Badge>}
              {generatingCount > 0 && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{generatingCount} Generating</Badge>}
              {generatedCount > 0 && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{generatedCount} Generated</Badge>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutateQueue()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <div className="grid gap-3">
          {queueItems.map(item => (
            <PostQueueCard key={item.id} item={item} onRetry={handleRetry} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="lg:pl-72">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          queueCount={pendingQueueCount}
          onNavigateToQueue={() => setActiveTab('queue')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Status Bar */}
        <div className="sticky top-16 z-30 flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-xs backdrop-blur">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Wifi className="h-3 w-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-destructive">
                <WifiOff className="h-3 w-3" /> Offline
              </span>
            )}
            <span className="text-muted-foreground">
              Last updated: {formatLastRefresh()}
            </span>
          </div>
          <span className="text-muted-foreground">
            Auto-refresh: 30s
          </span>
        </div>

        <main className="p-4 pb-24 lg:p-6 lg:pb-24">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
                  <p className="text-muted-foreground">Content generation overview and statistics</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Refresh Now
                </Button>
              </div>
              <StatsCards
                productsCount={products.length}
                queuedCount={queuedCount}
                generatingCount={generatingCount}
                generatedCount={generatedCount}
              />
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
                <p className="text-muted-foreground">Select products and click UGC/CGI/Image to send to n8n queue.</p>
              </div>
              {renderProductsGrid()}
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Post Queue</h1>
                <p className="text-muted-foreground">Data coming directly from "Post Queue"</p>
              </div>
              {renderQueueGrid()}
            </div>
          )}

          {/* Generated Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Generated Content</h1>
                  <p className="text-muted-foreground">
                    Select multiple contents using checkbox • Schedule or Post Now in bulk
                  </p>
                </div>
                <Button 
                  onClick={() => mutateGenerated()} 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Refresh Now
                </Button>
              </div>

              {/* Bulk Action Bar */}
              {selectedContent.length > 0 && (
                <div className="sticky top-4 z-40 rounded-lg border bg-card p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{selectedContent.length} items selected</span>
                    <Button variant="ghost" size="sm" onClick={handleClearContentSelection}>
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleBulkScheduledPost}
                      disabled={!scheduledDateTime}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Schedule Post
                    </Button>
                    <Button onClick={handleBulkPostNow} variant="default">
                      Post Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Content Grid */}
              {generatedLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Spinner width={32} height={32} />
                    <p className="text-muted-foreground">Loading generated content...</p>
                  </div>
                </div>
              ) : fetchGeneratedError ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </EmptyMedia>
                      <EmptyTitle>Failed to load generated content</EmptyTitle>
                      <EmptyDescription>{fetchGeneratedError}</EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={() => mutateGenerated()} variant="outline" className="mt-4 gap-2">
                      <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                  </Empty>
                </div>
              ) : generatedContent.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><Video className="h-6 w-6" /></EmptyMedia>
                    <EmptyTitle>No content generated yet</EmptyTitle>
                    <EmptyDescription>Select products from Products tab and generate content.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {generatedContent.map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onUpload={handleUploadToSocial}
                      isUploading={uploadingId === content.id}
                      isSelected={selectedContent.some(c => c.id === content.id)}
                      onToggleSelect={handleToggleContentSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New: Social Uploads Tab */}
          {activeTab === 'upload' && <SocialUploads />}

          {/* Settings Tab */}
          {activeTab === 'settings' && <SettingsPage />}

          {/* Library & Upload Tab (Coming Soon) */}
        
        </main>
      </div>

      {/* Bottom Toolbar - Only for Products */}
      <GenerateToolbar
        selectedCount={selectedProducts.length}
        onClear={handleClearSelection}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  )
}