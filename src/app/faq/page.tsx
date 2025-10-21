import { AuthHeader } from '@/components/auth-header'

export const metadata = {
  title: 'FAQ - Robbiemoto',
  description: 'Frequently asked questions',
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'Can I get one of these leather wallets in a different color?',
      answer: 'Yes you can! You will notice that within a listing, there\'s a picture of the color options that you can choose from. Occasionally, I may be running low or out of a specific color and may not be able to offer that as an option. If you don\'t see the color you would like available, please feel free to reach out to me at: info@robbiemoto.com',
    },
    {
      question: 'Can you make custom handmade leather accessories?',
      answer: 'I am always happy to make simple design/color changes. Just reach out to me with your ideas. If you have a completely new design in mind, please feel free to send me a sketch or description of it and I will let you know if it\'s something I can do! Email me at: info@robbiemoto.com',
    },
    {
      question: 'After purchasing an item, how long will it take to ship?',
      answer: 'All of my designs are made to order. Please allow me 4-6 business days to create your item. The time it takes will depend on how many orders I have received that week but rest assured, I will make your item in the order it is received and as soon as I can. If you are on a time crunch, you are welcome to reach out to me directly for a more accurate ETA. Email me at: info@robbiemoto.com',
    },
    {
      question: 'Do you do consignment or wholesale?',
      answer: 'Sorry but I do not work on a consignment basis. I do offer a wholesale discount to shops. If you are interested, please reach out to me for my line-sheet and wholesale policies at: info@robbiemoto.com Thank you!',
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

