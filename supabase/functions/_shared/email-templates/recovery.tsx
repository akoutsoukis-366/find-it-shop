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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="el" dir="ltr">
    <Head />
    <Preview>Επαναφορά κωδικού πρόσβασης για τη Metavex</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Επαναφορά κωδικού πρόσβασης</Heading>
        <Text style={text}>
          Λάβαμε αίτημα για επαναφορά του κωδικού πρόσβασής σου στη Metavex.
          Πάτησε το κουμπί παρακάτω για να ορίσεις νέο κωδικό.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Επαναφορά Κωδικού
        </Button>
        <Text style={footer}>
          Αν δεν ζήτησες επαναφορά κωδικού, μπορείς να αγνοήσεις αυτό το email.
          Ο κωδικός σου δεν θα αλλάξει.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f3f46', lineHeight: '1.6', margin: '0 0 22px' }
const button = { backgroundColor: '#0055ff', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '30px 0 0' }
