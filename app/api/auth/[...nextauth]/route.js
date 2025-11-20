import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

export const authOptions = {
  // WICHTIG: Secret für Session Encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner",
        },
      },
    }),
  ],

  // Cookie Konfiguration für OAuth State
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      const validEmails = [
        "johannes.schmidbauer@homeoftalents.de",
        "edwin.tetteh@homeoftalents.de",
        "christopher.buecklein@homeoftalents.de",
        "johannes.schmidbauer@leoninestudios.com",
        "edwin.tetteh@leoninestudios.com",
        "christopher.buecklein@leoninestudios.com",
        "business.chris.buck@gmail.com",
      ];

      // ist die Email valide?
      if (validEmails.some((e) => e === user.email)) {
        try {
          // gibt es den User schon?
          console.info('Diese Email ist vorhanden')
          const existingUser = await prisma.user.findFirst({
            where: { email: user.email },
          });

          // wenn nein, dann lege den User in der Datenbank an
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            });
            return true;
          }
          // wenn ja, gib mir den User aus der Datenbank zurück
          return true;
        } catch (error) {
          console.error("Database error in signIn:", error);
          return false;
        }
      } else {
        // wenn die Emailadresse nicht valide ist, dann ist der Loginversuch gescheitert
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      if (account) {
        try {
          const updatedUser = await prisma.user.update({
            where: {
              email: token.email,
            },
            data: {
              id_token: account.id_token,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });

          // Token mit account info erweitern
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        } catch (error) {
          console.error("Database error in jwt callback:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      try {
        const googleAccount = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (!googleAccount) {
          console.error("User not found in database");
          return session;
        }

        // Check if token expired
        if (
          googleAccount.expires_at &&
          googleAccount.expires_at * 1000 < Date.now()
        ) {
          console.log("Access token expired, refreshing...");

          // If the access token has expired, try to refresh it
          try {
            const response = await fetch(
              "https://oauth2.googleapis.com/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  client_id: process.env.GOOGLE_CLIENT_ID, // FIX: Richtige ENV Variable
                  client_secret: process.env.GOOGLE_CLIENT_SECRET, // FIX: Richtige ENV Variable
                  grant_type: "refresh_token",
                  refresh_token: googleAccount.refresh_token,
                }),
              }
            );

            const tokensOrError = await response.json();

            if (!response.ok) {
              console.error("Failed to refresh token:", tokensOrError);
              throw new Error(tokensOrError.error || "Failed to refresh token");
            }

            console.log("Token refreshed successfully");

            await prisma.user.update({
              where: {
                email: googleAccount.email,
              },
              data: {
                access_token: tokensOrError.access_token,
                expires_at: Math.floor(
                  Date.now() / 1000 + tokensOrError.expires_in
                ),
                refresh_token:
                  tokensOrError.refresh_token || googleAccount.refresh_token,
              },
            });
          } catch (error) {
            console.error("Error refreshing access_token:", error);
            // If we fail to refresh the token, return an error so we can handle it on the page
            session.error = "RefreshTokenError";
          }
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },

  // // Zusätzliche Konfiguration
  // pages: {
  //   signIn: '/auth/signin', // Optional: Custom Sign-in Page
  //   error: '/auth/error', // Optional: Custom Error Page
  // },

  debug: process.env.NODE_ENV === "development", // Debug logs in development
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
