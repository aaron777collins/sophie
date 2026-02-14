import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FirstRunExperienceProvider } from '@/components/onboarding/first-run-provider'
import { MatrixProvider } from '@/components/providers/matrix-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HAOS - Discord for Matrix',
  description: 'A Discord-style Matrix client for decentralized communication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-discord-dark text-white`}>
        <MatrixProvider>
          <FirstRunExperienceProvider>
            {children}
          </FirstRunExperienceProvider>
        </MatrixProvider>
      </body>
    </html>
  )
}