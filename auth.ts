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
              id: res.data.data.id,
              name: res.data.data.name,
              email: res.data.data.email,
              area: res.data.data.area,
              department: res.data.data.department,
              access_token: res.data.access_token,
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
        token.is_admin = user.is_admin;
        token.is_leader_department = user.is_leader_department;
        token.is_leader_area = user.is_leader_area;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: token.email as string,
        is_admin: token.is_admin as boolean | null | undefined,
        is_leader_department: token.is_leader_department as boolean | null | undefined,
        is_leader_area: token.is_leader_area as boolean | null | undefined,
        emailVerified: new Date(),
      };
      session.access_token = token.access_token as string;
      return session;
    },
  },
});
