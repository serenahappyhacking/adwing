import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },
  providers: [
    // Shopify OAuth — custom provider
    {
      id: "shopify",
      name: "Shopify",
      type: "oauth",
      authorization: {
        url: "https://{shop}.myshopify.com/admin/oauth/authorize",
        params: {
          scope: process.env.SHOPIFY_SCOPES,
          client_id: process.env.SHOPIFY_API_KEY,
        },
      },
      token: "https://{shop}.myshopify.com/admin/oauth/access_token",
      clientId: process.env.SHOPIFY_API_KEY,
      clientSecret: process.env.SHOPIFY_API_SECRET,
      profile(profile) {
        return {
          id: profile.id?.toString(),
          name: profile.name,
          email: profile.email,
        };
      },
    },
    // Email/password for development & direct signups
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // In production, verify password hash
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          // Auto-create for dev
          const newUser = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            },
          });
          return newUser;
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return db.user.findUnique({
    where: { id: session.user.id },
    include: {
      stores: true,
      adAccounts: true,
      subscription: true,
    },
  });
}
