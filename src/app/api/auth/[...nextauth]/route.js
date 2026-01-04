// src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // GANTI DENGAN LOGIC AUTHENTICATION ANDA
        // Contoh sederhana (JANGAN PAKAI DI PRODUCTION!):
        if (credentials?.username === 'admin' && credentials?.password === 'admin123') {
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@company.com',
            role: 'admin'
          };
        }
        
        // Return null jika authentication gagal
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };