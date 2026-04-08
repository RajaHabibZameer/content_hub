import { NextResponse } from 'next/server'
import type { QueueItem, Product, QueueStatus } from '@/lib/mock-data'

// Google Sheets Configuration
const GOOGLE_SHEETS_ID = '1T3EBnkT551i0Fmdk_r2-kgkzT2JRtAteeYnWIsTTcF8'
const GOOGLE_SHEETS_API_KEY = 'AIzaSyADiqa5PKRV9lSoPPizJvZ0F7U3eNzAAAI'
const SHEET_NAME = 'Post Queue'

export async function GET() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${GOOGLE_SHEETS_API_KEY}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text())
      return NextResponse.json({ queue: [] }, { status: response.status })
    }

    const data = await response.json()
    const rows: string[][] = data.values || []

    if (rows.length < 2) {
      return NextResponse.json({ queue: [] })
    }

    const headers = rows[0].map((h: string) => h.toLowerCase().trim().replace(/\s+/g, ''))

    const nameIndex = headers.findIndex((h: string) => h === 'name')
    const imageVideoIndex = headers.findIndex((h: string) => 
      ['image/vedio', 'image/video', 'imagevedio', 'image', 'video'].includes(h)
    )
    const variationIndex = headers.findIndex((h: string) => h === 'variation')
    const aspectRatioIndex = headers.findIndex((h: string) => h === 'aspectratio' || h === 'aspect_ratio')
    const ideaIndex = headers.findIndex((h: string) => h === 'idea')
    const versionIndex = headers.findIndex((h: string) => h === 'version')
    const statusIndex = headers.findIndex((h: string) => h === 'status')

    const queue: QueueItem[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const productName = nameIndex !== -1 && row[nameIndex] ? String(row[nameIndex]).trim() : ''
      if (!productName) continue

      const product: Product = {
        id: String(i),
        name: productName,
        description: '',
        image_url: imageVideoIndex !== -1 && row[imageVideoIndex] 
          ? String(row[imageVideoIndex]).trim() 
          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        category: 'Product',
        price: 0,
      }

      const rawStatus = statusIndex !== -1 && row[statusIndex] 
        ? String(row[statusIndex]).toLowerCase().trim()
        : 'queued'
      
      const validStatuses: QueueStatus[] = ['queued', 'generating', 'generated']
      const status: QueueStatus = validStatuses.includes(rawStatus as QueueStatus) ? rawStatus as QueueStatus : 'queued'

      const queueItem: QueueItem = {
        id: `queue-${i}-${Date.now().toString().slice(-6)}`,
        product,
        content_type: 'ugc',
        status,
        created_at: new Date().toISOString(),
        variation: variationIndex !== -1 ? String(row[variationIndex] || '') : undefined,
        aspectRatio: aspectRatioIndex !== -1 ? String(row[aspectRatioIndex] || '') : undefined,
        idea: ideaIndex !== -1 ? String(row[ideaIndex] || '') : undefined,
        version: versionIndex !== -1 ? String(row[versionIndex] || '') : undefined,
      }

      queue.push(queueItem)
    }

    return NextResponse.json({ queue })
  } catch (error) {
    console.error('Queue API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch queue', queue: [] }, { status: 500 })
  }
}
