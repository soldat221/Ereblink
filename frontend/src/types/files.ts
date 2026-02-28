export type FileItemDto = {
    id: number;
    originalName: string;
    contentType: string;
    size: number;
    createdAt: string;
};

export type FileDetailDto = {
    id: number;
    originalName: string;
    contentType: string;
    size: number;
    createdAt: string;
    ownerUsername: string;
};