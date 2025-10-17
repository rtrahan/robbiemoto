import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WinnerEmailProps {
  userName: string
  lotTitle: string
  winningBid: string
  shipping: string
  tax: string
  total: string
  orderUrl: string
}

export const WinnerEmail = ({
  userName = 'Winner',
  lotTitle = 'Handcrafted Mug',
  winningBid = '$75.00',
  shipping = '$8.99',
  tax = '$0.00',
  total = '$83.99',
  orderUrl = 'https://robbiemoto.com/account/orders',
}: WinnerEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Congratulations! You won {lotTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={celebration}>🎉</div>
          <Heading style={h1}>Congratulations, You Won!</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            Great news! You're the winning bidder for <strong>{lotTitle}</strong>.
          </Text>
          
          <Section style={orderBox}>
            <Text style={orderTitle}>Order Summary</Text>
            <div style={orderLine}>
              <span>Winning bid:</span>
              <span>{winningBid}</span>
            </div>
            <div style={orderLine}>
              <span>Shipping:</span>
              <span>{shipping}</span>
            </div>
            <div style={orderLine}>
              <span>Tax:</span>
              <span>{tax}</span>
            </div>
            <div style={orderTotal}>
              <span>Total:</span>
              <span>{total}</span>
            </div>
          </Section>
          
          <Text style={text}>
            Your payment method will be charged automatically. Once payment is confirmed,
            we'll send you shipping details.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={orderUrl}>
              View Order Details
            </Button>
          </Section>
          
          <Text style={text}>
            <strong>What's Next?</strong>
          </Text>
          
          <Text style={text}>
            1. Your card will be charged within the next few minutes<br />
            2. You'll receive a payment confirmation email<br />
            3. We'll carefully package your item<br />
            4. You'll get tracking information once shipped
          </Text>
          
          <Text style={footer}>
            Thank you for your purchase!<br />
            The Robbiemoto Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WinnerEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const celebration = {
  fontSize: '48px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
}

const orderBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
}

const orderTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '16px',
}

const orderLine = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '15px',
  color: '#666',
  marginBottom: '8px',
}

const orderTotal = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  borderTop: '2px solid #e5e7eb',
  paddingTop: '12px',
  marginTop: '12px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '30px',
}
