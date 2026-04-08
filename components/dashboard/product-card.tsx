'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Product } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onToggleSelect: (product: Product) => void
}

export function ProductCard({ product, isSelected, onToggleSelect }: ProductCardProps) {
  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onToggleSelect(product)}
    >
      <div className="relative aspect-square">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          crossOrigin="anonymous"
        />
        <div className="absolute left-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(product)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 border-2 bg-background/80 backdrop-blur-sm"
          />
        </div>
        {product.category && (
          <Badge className="absolute right-2 top-2" variant="secondary">
            {product.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
