import React from 'react'
import './globals.css'
import { LanguageProvider } from '@/contexts/language-context'

export const metadata = {
  title: 'My Book - Reading App',
  description: 'A modern book reading application with multilingual support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body>
        <LanguageProvider defaultLanguage="ru">
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}