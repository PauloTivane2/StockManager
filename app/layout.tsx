import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { MainLayout } from './components/layout/main-layout'
import { NotificationProvider } from './contexts/notification-context'
import { NotificationContainer } from './components/notifications/notification-container'
import { InitializeStore } from '@/components/providers/initialize-store'
import { AuthProvider } from '@/components/providers/auth-provider'
import { SmartDialog } from '@/components/ui/smart-dialog'
import { Toaster } from '@/components/ui/sonner'

const montserrat = Montserrat({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-montserrat',
});

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
    <html lang="pt-BR" className={`${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <NotificationProvider>
            <InitializeStore />
            <MainLayout>
              {children}
            </MainLayout>
            <NotificationContainer />
          </NotificationProvider>
          {/* Global dialog & toast — mounted once, usable anywhere */}
          <SmartDialog />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
