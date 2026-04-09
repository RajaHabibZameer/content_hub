import { NextResponse } from 'next/server'

// ==================== GOOGLE SHEETS CONFIG ====================
const GOOGLE_SHEETS_ID = '1T3EBnkT551i0Fmdk_r2-kgkzT2JRtAteeYnWIsTTcF8'
const GOOGLE_SHEETS_API_KEY = 'AIzaSyADiqa5PKRV9lSoPPizJvZ0F7U3eNzAAAI'
const SHEET_NAME = 'SocialUploads'   // ← Yeh sheet ka exact naam hai jahan se data aana hai

export async function GET() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 30 },   // Cache for 30 seconds
    })

    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text())
      return NextResponse.json({ 
        uploads: [], 
        error: `HTTP Error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    const rows: string[][] = data.values || []

    if (rows.length < 2) {
      return NextResponse.json({ uploads: [] })
    }

    // Headers ko clean karte hain (lowercase + underscore)
    const headers = rows[0].map((h: string) => 
      h.toLowerCase().trim().replace(/\s+/g, '_')
    )

    const uploads: any[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const productName = headers.findIndex(h => h.includes('product_name') || h.includes('name'))
      const previewUrlIndex = headers.findIndex(h => 
        h.includes('link') || h.includes('url') || h.includes('preview')
      )
      const captionIndex = headers.findIndex(h => h.includes('caption'))
      const hashtagIndex = headers.findIndex(h => h.includes('hashtag'))
      const contentTypeIndex = headers.findIndex(h => 
        h.includes('content_type') || h.includes('type')
      )
      const scheduledTimeIndex = headers.findIndex(h => 
        h.includes('scheduled') || h.includes('schedule_time')
      )
      const postedAtIndex = headers.findIndex(h => 
        h.includes('posted_at') || h.includes('posted') || h.includes('publish')
      )
      const statusIndex = headers.findIndex(h => h.includes('status'))
      const platformIndex = headers.findIndex(h => h.includes('platform'))

      const item = {
        id: `social-${i}-${Date.now().toString().slice(-8)}`,
        
        product_name: productName !== -1 && row[productName] 
          ? String(row[productName]).trim() 
          : 'Unknown Product',

        content_type: contentTypeIndex !== -1 && row[contentTypeIndex] 
          ? String(row[contentTypeIndex]).trim() 
          : 'ugc',

        preview_url: previewUrlIndex !== -1 && row[previewUrlIndex] 
          ? String(row[previewUrlIndex]).trim() 
          : '',

        caption: captionIndex !== -1 ? String(row[captionIndex] || '') : '',
        hashtag: hashtagIndex !== -1 ? String(row[hashtagIndex] || '') : '',

        scheduled_time: scheduledTimeIndex !== -1 && row[scheduledTimeIndex] 
          ? String(row[scheduledTimeIndex]).trim() 
          : '',

        posted_at: postedAtIndex !== -1 && row[postedAtIndex] 
          ? String(row[postedAtIndex]).trim() 
          : '',

        status: statusIndex !== -1 && row[statusIndex] 
          ? String(row[statusIndex]).trim() 
          : 'ready',

        platform: platformIndex !== -1 && row[platformIndex] 
          ? String(row[platformIndex]).trim() 
          : 'Instagram', // default agar column na ho

        created_at: new Date().toISOString(),
      }

      // Agar product name empty ho to skip kar do
      if (!item.product_name || item.product_name === 'Unknown Product') continue

      uploads.push(item)
    }

    // Latest uploads pehle dikhayein
    uploads.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ 
      uploads,
      total: uploads.length 
    })

  } catch (error: any) {
    console.error('Social Uploads API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch data from Google Sheet', 
      uploads: [] 
    }, { status: 500 })
  }
}