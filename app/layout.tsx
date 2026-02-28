import type { Metadata } from 'next'
import './globals.css'
import SessionProviderWrapper from '../components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Bible Drawing Video Pipeline V2',
  description: 'Video editing platform for Bible drawing content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}