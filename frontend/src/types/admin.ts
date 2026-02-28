export type Role = "USER" | "ADMIN";

export type AdminUserDto = {
    id: number;
    username: string;
    role: Role;
    enabled: boolean;
};