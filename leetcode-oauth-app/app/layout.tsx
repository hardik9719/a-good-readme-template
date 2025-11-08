import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeetCode OAuth App',
  description: 'OAuth application with Google sign-in and LeetCode integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
