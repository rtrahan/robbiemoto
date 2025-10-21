import { AuthHeader } from '@/components/auth-header'

export const metadata = {
  title: 'Shipping & Returns - Robbiemoto',
  description: 'Shipping and return policies',
}

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
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
        <div className="container px-4 py-20 md:px-8 max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-light mb-12">Shipping & Returns</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Shipping Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                All of our items are made to order, therefore we ask you to allow us <strong>4-6 business days</strong> for your item to ship. We can ship your item USPS first class, Priority or Priority Express. You choose how you would like us to ship it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Return Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We accept returns and exchanges on most items although we do not accept returns for custom or personalized orders.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 my-6">
                <p className="font-medium text-gray-900 mb-2">Wholesale orders:</p>
                <p className="text-gray-700">
                  We do not accept returns on wholesale orders, however we do guarantee the quality of our work, so if there is a flaw in the craftsmanship or mistake on our end we will happily repair, replace it or issue a refund.
                </p>
              </div>

              <ul className="space-y-2 text-gray-700">
                <li><strong>Contact us within:</strong> 14 days of delivery</li>
                <li><strong>Ship items back within:</strong> 30 days of delivery</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mt-4">
                We guarantee the quality of our handmade items, so if there is a flaw in the craftsmanship or mistake on our end, we will happily repair, replace it or issue a refund. However, shipping charges are non-refundable.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <p className="text-sm text-gray-900">
                  <strong>PLEASE NOTE:</strong> This does NOT include custom items, custom items are nonexchangeable and nonrefundable. This includes all iPhone wallets as these are made custom sizes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Payment Method</h2>
              <p className="text-gray-700 leading-relaxed">
                We accept all major credit cards or PayPal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Wholesale Inquiries</h2>
              <p className="text-gray-700 leading-relaxed">
                I love working with shops and am happy to offer wholesale discounts. If interested, please contact me at{' '}
                <a href="mailto:info@robbiemoto.com" className="text-gray-900 underline">info@robbiemoto.com</a>{' '}
                and we will work up an order together. I hope to work together!
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

