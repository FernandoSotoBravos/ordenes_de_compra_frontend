import NextAuth from "next-auth";

// Extender la interfaz `User` para incluir las nuevas propiedades
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    area: string | null;
    role: string;
    department: string | null;
    leader: number;
    access_token: string;
    refresh_token: string;
  }

  interface Session {
    user: User; 
    access_token: string;
    refresh_token: string;
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    area: string;
    role: string;
    department: string | null;
    leader: number;
    access_token: string;
    refresh_token: string;
  }
}
