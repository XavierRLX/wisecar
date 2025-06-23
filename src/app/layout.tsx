// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'          // ← importa Script
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'
import ClientOnly from '@/components/ClientOnly'
import GlobalNav from '@/components/GlobalNav'
import Providers from './providers'
import ContentWrapper from '@/components/ContentWrapper'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'All Wheels',
  description: 'Gerencie suas manutenções, desejos e consulta FIPE num só lugar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          id="adsense"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5598392740749077"
          crossOrigin="anonymous"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased bg-gray-100 text-gray-900
          overflow-x-hidden
        `}
      >
        <Providers>
          <ClientOnly>
            <GlobalNav />
          </ClientOnly>
          <ContentWrapper>{children}</ContentWrapper>
        </Providers>
      </body>
    </html>
  )
}
