import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

export const authOptions = {
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
    // ...add more providers here
  ],
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
        // gibt es den User schon?
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
          return newUser;
        }
        // wenn ja, gib mir den User aus der Datenbank zurück
        return existingUser;
      } else {
        // wenn die Emailadresse nicht valide ist, dann ist der Loginversuch gescheitert
        return null;
      }
    },
    async jwt({ token, account, profile }) {
      // console.log({ token, account });

      if (account) {
        console.log(account.access_token)
        const updatedUser = await prisma.user.update({
          where: {
            email: token.email,
          },
          data: {
            id_token: account.id_token,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at
          },
        });
      }

      return token;
    },
    async session({ session, user }) {
      const [googleAccount] = await prisma.user.findMany({
        where: { email: session.user.email},
      })

      if (googleAccount.expires_at * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          // https://accounts.google.com/.well-known/openid-configuration
          // We need the `token_endpoint`.
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID,
              client_secret: process.env.AUTH_GOOGLE_SECRET,
              grant_type: "refresh_token",
              refresh_token: googleAccount.refresh_token,
            }),
          })
 
          const tokensOrError = await response.json()

          console.log('token or Error', tokensOrError)
 
          if (!response.ok) throw new Error
 
        
          await prisma.user.update({
            data: {
              access_token: tokensOrError.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokensOrError.expires_in),
              refresh_token:
              tokensOrError.refresh_token ?? googleAccount.refresh_token,
            },
            where: {
              email: googleAccount.email
            },
          })
        } catch (error) {
          console.error("Error refreshing access_token", error)
          // If we fail to refresh the token, return an error so we can handle it on the page
          session.error = "RefreshTokenError"
        }
      }
      return session
    },
  
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
