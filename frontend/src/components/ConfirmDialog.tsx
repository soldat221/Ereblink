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
        <div className="dialog-backdrop" role="presentation">
            <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn--ghost" onClick={onCancel}>
                        Zrušit
                    </button>
                    <button type="button" className="btn btn--danger" onClick={onConfirm}>
                        Potvrdit
                    </button>
                </div>
            </div>
        </div>
    );
}
