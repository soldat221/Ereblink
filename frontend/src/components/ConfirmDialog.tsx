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
                <div className="dialog__header">
                    <h3 className="dialog__title">{title}</h3>
                </div>
                <p className="dialog__text">{text}</p>
                <div className="dialog__actions">
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
