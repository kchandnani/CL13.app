import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MainNav } from '@/components/layout/main-nav'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://fntz-ai.vercel.app' // Replace with your actual production URL
    : 'http://localhost:3000'
  ),
  title: 'FNTZ AI - Fantasy Football Assistant',
  description: 'Your intelligent NFL fantasy football companion',
  keywords: ['fantasy football', 'NFL', 'AI assistant', 'player analysis', 'roster management'],
  authors: [{ name: 'FNTZ AI' }],
  icons: {
    icon: [
      { url: '/logos/logo_icon_64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/logos/logo_icon_128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/logos/logo_icon_256x256.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/logos/logo_icon_256x256.png',
    shortcut: '/logos/logo_icon_64x64.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'FNTZ AI - Fantasy Football Assistant',
    description: 'Your intelligent NFL fantasy football companion with AI-powered player analysis, roster optimization, and league management.',
    siteName: 'FNTZ AI',
    images: [
      {
        url: '/logos/logo_full.png',
        width: 1200,
        height: 630,
        alt: 'FNTZ AI - Fantasy Football Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FNTZ AI - Fantasy Football Assistant',
    description: 'Your intelligent NFL fantasy football companion',
    images: ['/logos/logo_full.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col bg-background">
          <MainNav />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
} 