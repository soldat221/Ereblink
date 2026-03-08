type ApiErrorShape = {
    response?: {
        data?: {
            message?: unknown;
        };
    };
    message?: unknown;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
    const typed = error as ApiErrorShape;

    if (typeof typed?.response?.data?.message === "string") {
        return typed.response.data.message;
    }

    if (typeof typed?.message === "string") {
        return typed.message;
    }

    return fallback;
}
