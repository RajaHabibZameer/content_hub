export interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category: string
  price: number
}

// Queue status: queued -> generating -> generated
export type QueueStatus = 'queued' | 'generating' | 'generated'

export interface QueueItem {
  id: string
  product: Product
  content_type: 'ugc' | 'cgi' | 'ugc_cgi' | 'image'
  status: QueueStatus
  created_at: string
  variation?: string
  aspectRatio?: string
  idea?: string
  version?: string
}

export type GeneratedContent = {
  id: string;
  product_name: string;
  
  content_type: 'ugc' | 'cgi' | 'ugc_cgi' | 'image';
  link: string;
  status?: string;
  created_at: string;
  type?:string;
  // Extra fields from your Google Sheet
  caption?: string;
  hashtag?: string;
  variation?: string;
  version?: string;
}
export const contentTypeLabels: Record<string, string> = {
  ugc: 'UGC Video',
  cgi: 'CGI Video',
  ugc_cgi: 'UGC + CGI',
  image: 'Image',
}
