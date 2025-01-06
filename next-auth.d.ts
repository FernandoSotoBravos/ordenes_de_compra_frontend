import NextAuth from "next-auth";

// Extender la interfaz `User` para incluir las nuevas propiedades
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    is_admin?: boolean | null | undefined;
    is_leader_department?: boolean | null | undefined;
    is_leader_area?: boolean | null | undefined;
  }

  interface Session {
    user: User;
    access_token: string;
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    area: string;
    department: string;
  }
}
