import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { MainLayout } from './components/layout/main-layout'
import { NotificationProvider } from './contexts/notification-context'
import { NotificationContainer } from './components/notifications/notification-container'
import { InitializeStore } from '@/components/providers/initialize-store'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'InventoryHub - Gestão de Estoque',
  description: 'Plataforma web completa para gestão de estoque em Moçambique',
  generator: 'stock',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <NotificationProvider>
          <InitializeStore />
          <MainLayout>
            {children}
          </MainLayout>
          <NotificationContainer />
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
