// src/app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import ThemeProvider from './providers/ThemeProvider';

export const metadata = {
  title: 'DevOps Gateway',
  description: 'Jenkins & Kubernetes Management Portal',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}