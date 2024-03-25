import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({user, account}) {
      const validEmails = ['johannes.schmidbauer@leoninestudios.com', "edwin.tetteh@leoninestudios.com", 'christopher.buecklein@leoninestudios.com', 'business.chris.buck@gmail.com']
      // ist die Email valide?
      if(validEmails.some(e => e === user.email)) {
        // gibt es den User schon?
        const existingUser = await prisma.user.findFirst({where: {email: user.email}})
        // wenn nein, dann lege den User in der Datenbank an
        if (!existingUser) {
          const newUser = await prisma.user.create({data: {
            email: user.email,
            name: user.name,
            image: user.image
          }})
          return newUser
        }
        // wenn ja, gib mir den User aus der Datenbank zurück
        return existingUser
      } else {
        // wenn die Emailadresse nicht valide ist, dann ist der Loginversuch gescheitert
        return null
      }
    },
    // async jwt({ token, account, profile }) {
    //   const userInDatabase = await prisma.user.findUnique({where: {email: token.email}})
    //   // Persist the OAuth access_token and or the user id to the token right after signin
    //   token.id = userInDatabase.id
    //   token.role = userInDatabase.role
    //   return token
    // },
    // async session(session, token, user) {
    //   return session
    // }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
