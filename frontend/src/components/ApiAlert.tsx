type ApiAlertType = "info" | "success" | "error";

type Props = {
    type?: ApiAlertType;
    message?: string | null;
    onClose?: () => void;
};

export default function ApiAlert({ type = "info", message, onClose }: Props) {
    if (!message) return null;

    const border =
        type === "error"
            ? "1px solid #d33"
            : type === "success"
                ? "1px solid #3a3"
                : "1px solid #999";

    return (
        <div style={{ border, padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>{message}</div>
                {onClose && <button onClick={onClose}>X</button>}
            </div>
        </div>
    );
}