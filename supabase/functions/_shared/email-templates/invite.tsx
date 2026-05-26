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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="el" dir="ltr">
    <Head />
    <Preview>Έχεις προσκληθεί στη Metavex</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Έχεις προσκληθεί</Heading>
        <Text style={text}>
          Έχεις προσκληθεί να γίνεις μέλος της{' '}
          <Link href={siteUrl} style={link}>
            <strong>Metavex</strong>
          </Link>
          . Πάτησε το κουμπί παρακάτω για να αποδεχτείς την πρόσκληση και να
          δημιουργήσεις τον λογαριασμό σου.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Αποδοχή Πρόσκλησης
        </Button>
        <Text style={footer}>
          Αν δεν περίμενες αυτή την πρόσκληση, μπορείς να αγνοήσεις το email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 22px' }
const link = { color: 'hsl(220, 100%, 50%)', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(220, 100%, 50%)', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
