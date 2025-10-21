import { AuthHeader } from '@/components/auth-header'

export const metadata = {
  title: 'FAQ - Robbiemoto',
  description: 'Frequently asked questions',
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'How long does it take to receive my order?',
      answer: 'All items are made to order. Please allow 4-6 business days for production before shipping. Shipping time depends on the method you choose (First Class, Priority, or Priority Express).',
    },
    {
      question: 'Do you accept returns?',
      answer: 'Yes, we accept returns and exchanges on most items within 14 days of delivery. However, custom or personalized orders (including all iPhone wallets) are non-returnable. Items must be shipped back within 30 days.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and PayPal.',
    },
    {
      question: 'How do the monthly auctions work?',
      answer: 'We host monthly ceramic auctions featuring one-of-a-kind handcrafted pieces. Create an account, place bids, and if you win, we\'ll contact you about payment and shipping. Auctions feature soft-close bidding - if a bid comes in during the last 2 minutes, that item\'s timer resets to 2 minutes.',
    },
    {
      question: 'Do you offer wholesale pricing?',
      answer: 'Yes! We love working with shops and offer wholesale discounts. Please contact info@robbiemoto.com to discuss an order.',
    },
    {
      question: 'Where are your products made?',
      answer: 'All items are handcrafted under one roof in Chattanooga, TN by Robbie Matsumoto.',
    },
    {
      question: 'What if there\'s a defect in my item?',
      answer: 'We guarantee the quality of our handmade items. If there\'s a flaw in craftsmanship or a mistake on our end, we\'ll happily repair, replace, or refund it.',
    },
  ]

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
          <h1 className="text-4xl font-serif font-light mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-12">Common questions about orders, shipping, and our process</p>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-3">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              We're here to help! Reach out anytime.
            </p>
            <a 
              href="mailto:robbiemoto@gmail.com"
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

