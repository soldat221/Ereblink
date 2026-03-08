type ApiAlertType = "info" | "success" | "error";

type Props = {
    type?: ApiAlertType;
    message?: string | null;
    onClose?: () => void;
};

export default function ApiAlert({ type = "info", message, onClose }: Props) {
    if (!message) return null;

    return (
        <div className={`alert alert--${type}`}>
            <div className="alert__content">
                <div>{message}</div>
                {onClose ? (
                    <button type="button" className="btn btn--ghost" onClick={onClose}>
                        Zavřít
                    </button>
                ) : null}
            </div>
        </div>
    );
}
