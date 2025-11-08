import NextAuth, { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from './db'
import { UserType } from './types'

/**
 * NextAuth Configuration
 * Implements Strategy Pattern for different authentication methods
 * - Google OAuth Strategy
 * - Credentials Strategy (for Guest login)
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth Provider - Strategy Pattern
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Credentials Provider for Guest Login
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        // Create a guest user
        const guestUser = await prisma.user.create({
          data: {
            name: 'Guest User',
            userType: UserType.GUEST,
          },
        })

        return {
          id: guestUser.id,
          name: guestUser.name,
          email: guestUser.email,
          image: guestUser.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser) {
          // Update Google ID if not set
          if (!existingUser.googleId && account.providerAccountId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: account.providerAccountId,
                userType: UserType.GOOGLE,
              },
            })
          }
        } else {
          // Create new Google user
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
              userType: UserType.GOOGLE,
            },
          })
        }
      }

      return true
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!

        // Fetch additional user data
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            userType: true,
            leetcodeUsername: true,
          },
        })

        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            userType: dbUser.userType,
            leetcodeUsername: dbUser.leetcodeUsername,
          }
        }
      }

      return session
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
