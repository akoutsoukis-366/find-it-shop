/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="el" dir="ltr">
    <Head />
    <Preview>Επιβεβαίωσε το email σου για τη Metavex</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Καλώς ήρθες στη Metavex</Heading>
        <Text style={text}>
          Ευχαριστούμε που εγγράφηκες στη{' '}
          <Link href={siteUrl} style={link}>
            <strong>Metavex</strong>
          </Link>
          . Είμαστε ενθουσιασμένοι που σε έχουμε μαζί μας.
        </Text>
        <Text style={text}>
          Παρακαλούμε επιβεβαίωσε τη διεύθυνση email σου (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) πατώντας το κουμπί παρακάτω:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Επιβεβαίωση Email
        </Button>
        <Text style={footer}>
          Αν δεν δημιούργησες λογαριασμό, μπορείς να αγνοήσεις αυτό το email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 22px' }
const link = { color: '#0055ff', textDecoration: 'underline' }
const button = { backgroundColor: '#0055ff', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
