import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || "your-google-client-id",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "your-google-client-secret",
        }),
        Credentials({
            name: "Invitado",
            credentials: {},
            async authorize() {
                return { id: "guest", name: "Invitado", email: "guest@novoheritage.com" }
            },
        }),
    ],
    secret: process.env.AUTH_SECRET || "novo_heritage_temp_secret_key_12345",
    trustHost: true,
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
})
