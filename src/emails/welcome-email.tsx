import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  email: string
  confirmationUrl: string
}

export const WelcomeEmail = ({
  email = 'user@example.com',
  confirmationUrl = 'https://robbiemoto.com/confirm',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Robbiemoto - Confirm your email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Robbiemoto!</Heading>
          
          <Text style={text}>
            Thank you for joining our waitlist. You'll be the first to know about our upcoming auctions
            featuring handcrafted mugs and leather goods.
          </Text>
          
          <Text style={text}>
            Please confirm your email address to complete your subscription:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Confirm Email Address
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          <Link href={confirmationUrl} style={link}>
            {confirmationUrl}
          </Link>
          
          <Text style={footer}>
            If you didn't sign up for Robbiemoto, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            The Robbiemoto Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: '600',
  lineHeight: '36px',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
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
  padding: '12px 24px',
}

const link = {
  color: '#0066cc',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#999',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '30px',
}
