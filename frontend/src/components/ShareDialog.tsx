import { useMemo, useState } from "react";
import ApiAlert from "./ApiAlert";
import { apiClient } from "../api/apiClient";
import { getApiErrorMessage } from "../utils/apiError";

type AccessType = "PUBLIC" | "USER_ONLY" | "LIST";

type Props = {
    open: boolean;
    fileId: number;
    onClose: () => void;
    onCreated?: () => void;
};

type ShareCreatedResponse = {
    id: number;
    code: string;
    accessType: AccessType;
    expiresAt: string | null;
};

type CreateSharePayload = {
    fileId: number;
    accessType: AccessType;
    expiresAt: string | null;
    allowedUsername?: string;
    allowedUsernames?: string[];
};

export default function ShareDialog({ open, fileId, onClose, onCreated }: Props) {
    const [accessType, setAccessType] = useState<AccessType>("PUBLIC");
    const [expiresInHours, setExpiresInHours] = useState<string>("24");
    const [noExpiry, setNoExpiry] = useState(false);

    const [allowedUsername, setAllowedUsername] = useState("");
    const [allowedUsernames, setAllowedUsernames] = useState("");

    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [created, setCreated] = useState<ShareCreatedResponse | null>(null);

    const shareUrl = useMemo(() => {
        if (!created) return null;
        return `${window.location.origin}/s/${created.code}`;
    }, [created]);

    if (!open) return null;

    function calcExpiresAt(): string | null {
        if (noExpiry) return null;
        const hours = Number(expiresInHours);
        if (!Number.isFinite(hours) || hours <= 0) throw new Error("Zadej platné hodiny expirace (>0)");
        const dt = new Date(Date.now() + hours * 60 * 60 * 1000);
        return dt.toISOString();
    }

    async function createShare() {
        setMsg(null);
        setCreated(null);
        setBusy(true);

        try {
            const expiresAt = calcExpiresAt();
            const payload: CreateSharePayload = { fileId, accessType, expiresAt };

            if (accessType === "USER_ONLY") payload.allowedUsername = allowedUsername.trim();
            if (accessType === "LIST") {
                payload.allowedUsernames = allowedUsernames
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            const res = await apiClient.post<ShareCreatedResponse>("/shares", payload);
            setCreated(res.data);
            setMsg("Share vytvořen");
            onCreated?.();
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Nepodařilo se vytvořit share"));
        } finally {
            setBusy(false);
        }
    }

    async function copyLink() {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setMsg("Odkaz zkopírován");
    }

    return (
        <div className="dialog-backdrop" role="presentation">
            <div className="dialog" role="dialog" aria-modal="true" aria-label="Sdílet soubor">
                <div className="row" style={{ justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0 }}>Sdílet soubor</h3>
                    <button type="button" className="btn btn--ghost" onClick={onClose}>
                        Zavřít
                    </button>
                </div>

                <div className="stack" style={{ marginTop: "0.9rem" }}>
                    <ApiAlert
                        type={msg === "Share vytvořen" || msg === "Odkaz zkopírován" ? "success" : "error"}
                        message={msg}
                        onClose={() => setMsg(null)}
                    />

                    <label className="stack">
                        <span>Typ přístupu</span>
                        <select value={accessType} onChange={(e) => setAccessType(e.target.value as AccessType)}>
                            <option value="PUBLIC">Veřejné (kdokoliv s kódem)</option>
                            <option value="USER_ONLY">Pouze pro uživatele</option>
                            <option value="LIST">Pouze pro seznam uživatelů</option>
                        </select>
                    </label>

                    {accessType === "USER_ONLY" ? (
                        <label className="stack">
                            <span>Povolený uživatel (username)</span>
                            <input
                                className="field"
                                value={allowedUsername}
                                onChange={(e) => setAllowedUsername(e.target.value)}
                            />
                        </label>
                    ) : null}

                    {accessType === "LIST" ? (
                        <label className="stack">
                            <span>Povolení uživatelé (username, oddělené čárkou)</span>
                            <input
                                className="field"
                                placeholder="alice,bob,charlie"
                                value={allowedUsernames}
                                onChange={(e) => setAllowedUsernames(e.target.value)}
                            />
                        </label>
                    ) : null}

                    <label className="row">
                        <input type="checkbox" checked={noExpiry} onChange={(e) => setNoExpiry(e.target.checked)} />
                        <span>Bez expirace</span>
                    </label>

                    {!noExpiry ? (
                        <label className="stack">
                            <span>Expirace (v hodinách)</span>
                            <input
                                className="field"
                                value={expiresInHours}
                                onChange={(e) => setExpiresInHours(e.target.value)}
                            />
                        </label>
                    ) : null}

                    <div className="row" style={{ justifyContent: "flex-end" }}>
                        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
                            Zavřít
                        </button>
                        <button type="button" className="btn btn--primary" onClick={createShare} disabled={busy}>
                            Vytvořit
                        </button>
                    </div>

                    {created ? (
                        <div className="panel stack">
                            <div>
                                <b>Kód:</b> {created.code}
                            </div>
                            <div>
                                <b>Odkaz:</b> {shareUrl}
                            </div>
                            <div className="row">
                                <button type="button" className="btn btn--primary" onClick={copyLink}>
                                    Kopírovat odkaz
                                </button>
                            </div>
                            {created.expiresAt ? (
                                <div className="page-subtitle">
                                    Expiruje: {new Date(created.expiresAt).toLocaleString()}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
