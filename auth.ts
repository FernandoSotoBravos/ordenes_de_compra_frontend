import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { fetchWrapper } from "./app/api/axiosInstance";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email Address", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(c) {
      return fetchWrapper
        .post("/login", {
          data: {
            username: c.email,
            password: c.password,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            return {
              id: res.data.user_data.id,
              name: res.data.user_data.name,
              email: res.data.user_data.email,
              area: res.data.user_data.area,
              role: res.data.user_data.role,
              department: res.data.user_data.department,
              leader: res.data.user_data.leader,
              access_token: res.data.access_token,
              refresh_token: res.data.refresh_token,
            };
          }
          return null;
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: "secret",
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublicPage = nextUrl.pathname.startsWith("/public");

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.area = user.area;
        token.role = user.role;
        token.department = user.department;
        token.leader = user.leader;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: token.email as string,
        area: token.area as string | null,
        role: token.role as string,
        department: token.department as string | null,
        leader: token.leader as number,
        emailVerified: null,
        access_token: token.access_token as string,
        refresh_token: token.refresh_token as string,
      };
      session.access_token = token.access_token as string;
      session.refresh_token = token.refresh_token as string;
      return session;
    },
  },
});
