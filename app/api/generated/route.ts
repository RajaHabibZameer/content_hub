import { NextResponse } from 'next/server'
import type { GeneratedContent } from '@/lib/mock-data'

// ==================== GOOGLE SHEETS CONFIG ====================
const GOOGLE_SHEETS_ID = '1T3EBnkT551i0Fmdk_r2-kgkzT2JRtAteeYnWIsTTcF8'     // ← Apna ID yahan daal do
const GOOGLE_SHEETS_API_KEY = 'AIzaSyADiqa5PKRV9lSoPPizJvZ0F7U3eNzAAAI'       // ← Apna API Key yahan daal do
const SHEET_NAME = 'Generated Post'                                        // Sheet ka naam agar alag hai to change karo

export async function GET() {
  try {
    const url =  `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text())
      return NextResponse.json({ content: [] }, { status: response.status })
    }

    const data = await response.json()
    const rows: string[][] = data.values || []

    if (rows.length < 2) {
      return NextResponse.json({ content: [] })
    }

    // Headers ko small case + underscore mein convert kar rahe hain
    const headers = rows[0].map((h: string) => 
      h.toLowerCase().trim().replace(/\s+/g, '_')
    )

    // Column mapping according to your columns
    const productNameIndex = headers.findIndex((h: string) => 
      h.includes('product_name') || h.includes('name')
    )
    const linkIndex = headers.findIndex((h: string) => 
      h.includes('link') || h.includes('url') || h.includes('preview')
    )
    const captionIndex = headers.findIndex((h: string) => h.includes('caption'))
    const hashtagIndex = headers.findIndex((h: string) => h.includes('hashtag'))
    const typeIndex = headers.findIndex((h: string) => 
      h.includes('type') || h.includes('content_type')
    )
    const variationIndex = headers.findIndex((h: string) => h.includes('variation'))
    const versionIndex = headers.findIndex((h: string) => h.includes('version'))
    const statusIndex = headers.findIndex((h: string) => h.includes('status'))

    const content: GeneratedContent[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const productName = productNameIndex !== -1 && row[productNameIndex] 
        ? String(row[productNameIndex]).trim() 
        : 'Unknown Product'

      if (!productName) continue

      const previewUrl = linkIndex !== -1 && row[linkIndex] 
        ? String(row[linkIndex]).trim() 
        : ''

      const rawType = typeIndex !== -1 && row[typeIndex] 
        ? String(row[typeIndex]).toLowerCase().trim() 
        : 'ugc'

      const rawStatus = statusIndex !== -1 && row[statusIndex] 
        ? String(row[statusIndex]).toLowerCase().trim() 
        : 'ready'

      const contentItem: GeneratedContent = {
        id: `gen-${i}-${Date.now().toString().slice(-8)}`,
        
        product_name: productName,
        
        content_type: ['ugc', 'cgi', 'ugc_cgi', 'image'].includes(rawType) 
          ? (rawType as 'ugc' | 'cgi' | 'ugc_cgi' | 'image') 
          : 'ugc',

        link: previewUrl,

        // Extra fields jo aapke sheet mein hain (optional)
        caption: captionIndex !== -1 ? String(row[captionIndex] || '') : undefined,
        hashtag: hashtagIndex !== -1 ? String(row[hashtagIndex] || '') : undefined,
        variation: variationIndex !== -1 ? String(row[variationIndex] || '') : undefined,
        version: versionIndex !== -1 ? String(row[versionIndex] || '') : undefined,
        
        status: ['ready', 'uploaded', 'failed', 'scheduled'].includes(rawStatus) 
          ? rawStatus as any 
          : 'ready',

        created_at: new Date().toISOString(),
      }

      content.push(contentItem)
    }

    // Newest content pehle show ho
    content.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Generated Content API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch generated content from Google Sheet', 
      content: [] 
    }, { status: 500 })
  }
}