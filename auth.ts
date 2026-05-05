import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import postgres from "postgres"

const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Auth] DATABASE_URL is missing. Database sync disabled.");
    return null;
  }
  return postgres(url, { ssl: 'require' });
};

// Build-safe: only configure Google if secrets are available
const providers: any[] = [];
if (process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const sql = getSql();
      if (!sql) return true;  // Permitimos sin BD en dev

      try {
        await sql`
          INSERT INTO users (email, name, image, last_login)
          VALUES (${user.email}, ${user.name || ''}, ${user.image || ''}, NOW())
          ON CONFLICT (email)
          DO UPDATE SET
            name = EXCLUDED.name,
            image = EXCLUDED.image,
            last_login = NOW()
        `;
        return true;
      } catch (error) {
        console.error("[Auth] Error sincronizando usuario a Neon:", error);
        return true;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});