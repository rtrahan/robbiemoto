import Link from 'next/link'
import { AuthHeader } from '@/components/auth-header'

export default function ShopPage() {
  const categories = [
    { name: 'Men', slug: 'men', image: '/placeholder-men.jpg', description: 'Handcrafted accessories for men' },
    { name: 'Women', slug: 'women', image: '/placeholder-women.jpg', description: 'Elegant pieces for women' },
    { name: 'Leather Goods', slug: 'leather-goods', image: '/placeholder-leather.jpg', description: 'Premium leather accessories' },
    { name: 'Unisex', slug: 'unisex', image: '/placeholder-unisex.jpg', description: 'For everyone' },
    { name: 'Ceramics', slug: 'ceramics', image: '/placeholder-ceramics.jpg', description: 'Handmade ceramic pieces' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <a href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <img 
              src="/robbiemoto-horizontal.pdf" 
              alt="Robbiemoto" 
              className="h-[84px] w-auto"
            />
          </a>
          <AuthHeader />
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <div className="container px-4 py-20 md:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-light mb-4">Shop</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of handcrafted ceramics, leather goods, and accessories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="container px-4 pb-20 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop/${category.slug}`}
                className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-gray-900 transition-all hover:shadow-xl"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                    🏺
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-serif font-light mb-2 group-hover:text-gray-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                  <div className="mt-4 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    Browse →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

