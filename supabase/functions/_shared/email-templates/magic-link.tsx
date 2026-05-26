/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="el" dir="ltr">
    <Head />
    <Preview>Ο σύνδεσμος σύνδεσής σου για τη Metavex</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Σύνδεση στη Metavex</Heading>
        <Text style={text}>
          Πάτησε το κουμπί παρακάτω για να συνδεθείς στη Metavex. Ο σύνδεσμος
          λήγει σύντομα.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Σύνδεση
        </Button>
        <Text style={footer}>
          Αν δεν ζήτησες αυτόν τον σύνδεσμο, μπορείς να αγνοήσεις αυτό το email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 22px' }
const button = { backgroundColor: '#0055ff', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
