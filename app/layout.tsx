import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { MainLayout } from './components/layout/main-layout'
import { NotificationProvider } from './contexts/notification-context'
import { NotificationContainer } from './components/notifications/notification-container'
import { InitializeStore } from '@/components/providers/initialize-store'
import { AuthProvider } from '@/components/providers/auth-provider'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'InventoryHub - Gestão de Estoque',
  description: 'Plataforma web completa para gestão de estoque em Moçambique',
  generator: 'stock',
  icons: {
    icon: '/estoque.png',
    apple: '/estoque.png',
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
        <AuthProvider>
          <NotificationProvider>
            <InitializeStore />
            <MainLayout>
              {children}
            </MainLayout>
            <NotificationContainer />
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
