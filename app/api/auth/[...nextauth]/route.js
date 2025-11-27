// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

// =============================================================================
// HELPER: Token bei Google refreshen
// =============================================================================
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("Google token refresh failed:", tokens);
      return { error: "RefreshTokenError" };
    }

    return {
      accessToken: tokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
      refreshToken: tokens.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { error: "RefreshTokenError" };
  }
}

// =============================================================================
// CONFIG
// =============================================================================
const VALID_EMAILS = [
  "johannes.schmidbauer@homeoftalents.de",
  "edwin.tetteh@homeoftalents.de",
  "christopher.buecklein@homeoftalents.de",
  "johannes.schmidbauer@leoninestudios.com",
  "edwin.tetteh@leoninestudios.com",
  "christopher.buecklein@leoninestudios.com",
  "business.chris.buck@gmail.com",
];

// =============================================================================
// NEXTAUTH OPTIONS
// =============================================================================
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
            "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtubepartner",
          ].join(" "),
        },
      },
    }),
  ],

  callbacks: {
    // -------------------------------------------------------------------------
    // SIGN IN: Email Check + User in DB anlegen/updaten
    // -------------------------------------------------------------------------
    async signIn({ user, account }) {
      if (!VALID_EMAILS.includes(user.email)) {
        console.warn(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            id_token: account.id_token,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            id_token: account.id_token,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        });
        return true;
      } catch (error) {
        console.error("Database error in signIn:", error);
        return false;
      }
    },

    // -------------------------------------------------------------------------
    // JWT: Token Refresh Logic (hier statt im session callback!)
    // -------------------------------------------------------------------------
    async jwt({ token, account, user }) {
      // Erster Login
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          error: null,
        };
      }

      // Token noch gültig? (60s Buffer)
      const bufferSeconds = 60;
      if (token.expiresAt && Date.now() < (token.expiresAt - bufferSeconds) * 1000) {
        return token;
      }

      // Token abgelaufen – refreshen
      console.log(`Token expired for ${token.email}, refreshing...`);

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: { refresh_token: true },
      });

      if (!dbUser?.refresh_token) {
        console.error("No refresh token in database");
        return { ...token, error: "RefreshTokenError" };
      }

      const refreshed = await refreshAccessToken(dbUser.refresh_token);

      if (refreshed.error) {
        return { ...token, error: refreshed.error };
      }

      // Neue Tokens in DB speichern
      try {
        await prisma.user.update({
          where: { email: token.email },
          data: {
            access_token: refreshed.accessToken,
            expires_at: refreshed.expiresAt,
            refresh_token: refreshed.refreshToken,
          },
        });
      } catch (error) {
        console.error("Failed to persist refreshed tokens:", error);
      }

      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
        error: null,
      };
    },

    // -------------------------------------------------------------------------
    // SESSION: Nur Error Status weitergeben
    // -------------------------------------------------------------------------
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15,
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15,
      },
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };