// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],

//   secret: process.env.NEXTAUTH_SECRET, // ✅ ADD THIS

//   pages: {
//     signIn: "/login",
//   },
// });

// export { handler as GET, handler as POST };


// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";

// export const { handlers: { GET, POST }, auth } = NextAuth({
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
// });

// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import connectDB from "@/lib/db";
// import User from "@/models/User";

// export const { handlers: { GET, POST }, auth } = NextAuth({
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],

//   callbacks: {
//     async signIn({ user }) {
//       await connectDB();

//       const existingUser = await User.findOne({ email: user.email });

//       // If user already exists → allow login
//       if (existingUser) return true;

//       // If new user → allow login (we will complete profile later)
//       return true;
//     },

//     async session({ session }) {
//       return session;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// });

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    // 🔵 Google Login
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🔐 Email + Password Login
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        // ❌ User not found
        if (!user) {
          throw new Error("User not found");
        }

        // ❌ No password (Google account)
        if (!user.password) {
          throw new Error("Please login with Google");
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) {
          throw new Error("Invalid password");
        }

        // ✅ Login success
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
});