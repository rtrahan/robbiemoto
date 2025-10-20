import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/helpers'

export const metadata = {
  title: 'Manage Products',
  description: 'Manage shop products',
}

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Products</h1>
          <p className="text-sm text-muted-foreground">
            Add and manage shop products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Image</th>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-right p-4 font-medium">Price</th>
                <th className="text-right p-4 font-medium">Stock</th>
                <th className="text-center p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {product.mediaUrls && Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0 ? (
                        <img src={product.mediaUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🏺</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{formatCategory(product.category)}</Badge>
                  </td>
                  <td className="p-4 text-right font-medium">{formatCurrency(product.priceCents)}</td>
                  <td className="p-4 text-right">
                    {product.trackInventory ? (
                      <span className={product.stockQuantity > 0 ? 'text-gray-600' : 'text-red-600 font-medium'}>
                        {product.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="text-6xl opacity-10 mb-4">🏺</div>
                    <p className="text-gray-500 mb-4">No products yet</p>
                    <Link href="/admin/products/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Product
                      </Button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'outline' | 'destructive' | 'secondary' }> = {
    DRAFT: { label: 'Draft', variant: 'outline' },
    ACTIVE: { label: 'Active', variant: 'default' },
    SOLD_OUT: { label: 'Sold Out', variant: 'destructive' },
    ARCHIVED: { label: 'Archived', variant: 'secondary' },
  }
  
  const { label, variant } = config[status] || config.DRAFT
  
  return <Badge variant={variant}>{label}</Badge>
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    MEN: 'Men',
    WOMEN: 'Women',
    LEATHER_GOODS: 'Leather Goods',
    UNISEX: 'Unisex',
    CERAMICS: 'Ceramics',
  }
  return map[cat] || cat
}

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

