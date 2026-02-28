export type AccessType = "PUBLIC" | "USER_ONLY" | "LIST";

export type ShareListItemDto = {
    id: number;
    code: string;
    accessType: AccessType;
    expiresAt: string | null;
    createdAt: string;
    fileId: number;
    fileName: string;
};