type Props = {
    open: boolean;
    title: string;
    text: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({ open, title, text, onConfirm, onCancel }: Props) {
    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "grid",
                placeItems: "center",
            }}
        >
            <div style={{ background: "white", padding: 16, borderRadius: 12, width: 360 }}>
                <h3 style={{ marginTop: 0 }}>{title}</h3>
                <p>{text}</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onCancel}>Zrušit</button>
                    <button onClick={onConfirm}>Potvrdit</button>
                </div>
            </div>
        </div>
    );
}