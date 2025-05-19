import NextAuth from "next-auth";

// Extender la interfaz `User` para incluir las nuevas propiedades
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: number;
    is_admin?: boolean | null | undefined;
    is_leader_department?: boolean | null | undefined;
    is_leader_area?: boolean | null | undefined;
    isPower?: boolean | null;
    area: number | string;
    department: number | string;
    access_token: string;
    super_user: boolean
  }

  interface Session {
    user: User;
    access_token: string;
  }

  interface JWT {
    id: string;
    name: string;
    email: string;
    role: number;
    area: string;
    department: string;
  }
}
