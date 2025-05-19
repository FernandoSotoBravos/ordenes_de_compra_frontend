import { Session } from "@toolpad/core/AppProvider";

export interface CustomSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    email?: string | null;
    role: number;
    area: string | number;
    department: string | number;
    isPower: boolean | null;
    is_admin?: boolean | null | undefined;
    is_leader_department?: boolean | null | undefined;
    is_leader_area?: boolean | null | undefined;
    access_token: string;
    super_user: boolean
  };
}
