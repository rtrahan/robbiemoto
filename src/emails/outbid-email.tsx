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

interface OutbidEmailProps {
  userName: string
  lotTitle: string
  currentBid: string
  newMinBid: string
  lotUrl: string
  auctionEndsAt: string
}

export const OutbidEmail = ({
  userName = 'Bidder',
  lotTitle = 'Handcrafted Mug',
  currentBid = '$50.00',
  newMinBid = '$55.00',
  lotUrl = 'https://robbiemoto.com/lot/example',
  auctionEndsAt = 'in 2 hours',
}: OutbidEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been outbid on {lotTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You've Been Outbid!</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            Someone has placed a higher bid on <strong>{lotTitle}</strong>.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Current bid:</strong> {currentBid}
            </Text>
            <Text style={infoText}>
              <strong>Minimum to bid:</strong> {newMinBid}
            </Text>
            <Text style={infoText}>
              <strong>Auction ends:</strong> {auctionEndsAt}
            </Text>
          </Section>
          
          <Text style={text}>
            Don't miss out! Increase your bid to stay in the lead.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={lotUrl}>
              Place New Bid
            </Button>
          </Section>
          
          <Text style={footer}>
            Good luck!<br />
            The Robbiemoto Team
          </Text>
          
          <Text style={footerSmall}>
            You're receiving this because you placed a bid on this item.
            Manage your notification preferences in your account settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OutbidEmail

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

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
}

const infoText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
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

const footerSmall = {
  color: '#999',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '20px',
}
