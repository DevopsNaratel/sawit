// src/app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';


export const metadata = {
  title: 'DevOps Gateway',
  description: 'Jenkins & Kubernetes Management Portal',
};

const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}