import { NextResponse } from 'next/server'
import type { Product } from '@/lib/mock-data'

// Direct values (no env variables)
const GOOGLE_SHEETS_ID = '1T3EBnkT551i0Fmdk_r2-kgkzT2JRtAteeYnWIsTTcF8'
const GOOGLE_SHEETS_API_KEY = 'AIzaSyADiqa5PKRV9lSoPPizJvZ0F7U3eNzAAAI'
const SHEET_NAME = 'Product'

export async function GET() {
  try {
    // Direct URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Sheets API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Sheets' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rows = data.values || []

    if (rows.length < 2) {
      return NextResponse.json({ products: [] })
    }

    const headers = rows[0].map((h: string) => h.toLowerCase().trim())
    const nameIndex = headers.indexOf('name')
    const descriptionIndex = headers.indexOf('description')
    const imageUrlIndex = headers.findIndex(
      (h: string) =>
        h === 'image_url' ||
        h === 'image url' ||
        h === 'imageurl' ||
        h === 'image'
    )

    if (nameIndex === -1) {
      return NextResponse.json(
        { error: 'Google Sheet must have a "name" column' },
        { status: 400 }
      )
    }

    const products: Product[] = rows
      .slice(2) // Skip header row + first data row
      .map((row: string[], index: number) => ({
        id: String(index + 1),
        name: row[nameIndex] || '',
        description: descriptionIndex !== -1 ? row[descriptionIndex] || '' : '',
        image_url:
          imageUrlIndex !== -1
            ? row[imageUrlIndex] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        category: 'Product',
      }))
      .filter((p: Product) => p.name.trim() !== '')

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching products' },
      { status: 500 }
    )
  }
}