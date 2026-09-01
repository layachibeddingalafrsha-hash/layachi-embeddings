// NextAuth configuration for admin-only authentication
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const { db } = await connectToDatabase();
        const admin = await db.collection("admins").findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!admin) {
          throw new Error("Invalid credentials");
        }

        if (!admin.active) {
          throw new Error("Account is deactivated");
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.full_name,
          role: admin.role || "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
