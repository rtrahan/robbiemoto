import { AuthHeader } from '@/components/auth-header'

export const metadata = {
  title: 'Privacy Policy - Robbiemoto',
  description: 'Privacy and security policies',
}

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-serif font-light mb-12">Privacy & Security</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is of the highest importance to us. This policy outlines how we use, store, and protect your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use third-party banking services to verify payment securely. Your payment information is never stored on our servers. We collect only the data necessary to process your order and communicate with you about your purchase.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may contact you after your purchase is completed successfully to ensure satisfaction and gather feedback. Your email address will not be shared with third parties for marketing purposes without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-light mb-4">Safety & Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your security is of the highest importance to our business. We use industry-standard encryption and secure payment processing to protect your information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use third-party banking to verify payment, ensuring your financial data is handled with the highest security standards. Your personal information is stored securely and accessed only when necessary to fulfill your orders.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We collect data only when you make a purchase or sign up for our mailing list. This information is used solely to process orders, ship products, and send occasional updates about new drops and auctions (which you can unsubscribe from at any time).
              </p>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Questions?</h3>
              <p className="text-gray-700">
                If you have any questions about our privacy practices, please contact us at{' '}
                <a href="mailto:robbiemoto@gmail.com" className="text-gray-900 underline">robbiemoto@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

