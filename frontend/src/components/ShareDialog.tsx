import { useMemo, useState } from "react";
import ApiAlert from "./ApiAlert";
import { apiClient } from "../api/apiClient";

type AccessType = "PUBLIC" | "USER_ONLY" | "LIST";

type Props = {
    open: boolean;
    fileId: number;
    onClose: () => void;
};

type ShareCreatedResponse = {
    id: number;
    code: string;
    accessType: AccessType;
    expiresAt: string | null;
};

export default function ShareDialog({ open, fileId, onClose }: Props) {
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

            const payload: any = {
                fileId,
                accessType,
                expiresAt,
            };

            if (accessType === "USER_ONLY") {
                payload.allowedUsername = allowedUsername.trim();
            }
            if (accessType === "LIST") {
                payload.allowedUsernames = allowedUsernames
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            const res = await apiClient.post<ShareCreatedResponse>("/shares", payload);
            setCreated(res.data);
            setMsg("Share vytvořen");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? e?.message ?? "Nepodařilo se vytvořit share");
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
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "grid",
                placeItems: "center",
                padding: 16,
            }}
        >
            <div style={{ background: "white", padding: 16, borderRadius: 12, width: 520, maxWidth: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>Sdílet soubor</h3>
                    <button onClick={onClose}>X</button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <ApiAlert
                        type={msg === "Share vytvořen" || msg === "Odkaz zkopírován" ? "success" : "error"}
                        message={msg}
                        onClose={() => setMsg(null)}
                    />

                    <div style={{ display: "grid", gap: 10 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            Typ přístupu
                            <select value={accessType} onChange={(e) => setAccessType(e.target.value as AccessType)}>
                                <option value="PUBLIC">Veřejné (kdokoliv s kódem)</option>
                                <option value="USER_ONLY">Pouze pro uživatele</option>
                                <option value="LIST">Pouze pro seznam uživatelů</option>
                            </select>
                        </label>

                        {accessType === "USER_ONLY" && (
                            <label style={{ display: "grid", gap: 6 }}>
                                Povolený uživatel (username)
                                <input value={allowedUsername} onChange={(e) => setAllowedUsername(e.target.value)} />
                            </label>
                        )}

                        {accessType === "LIST" && (
                            <label style={{ display: "grid", gap: 6 }}>
                                Povolení uživatelé (username, oddělené čárkou)
                                <input
                                    placeholder="alice,bob,charlie"
                                    value={allowedUsernames}
                                    onChange={(e) => setAllowedUsernames(e.target.value)}
                                />
                            </label>
                        )}

                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="checkbox" checked={noExpiry} onChange={(e) => setNoExpiry(e.target.checked)} />
                            Bez expirace
                        </label>

                        {!noExpiry && (
                            <label style={{ display: "grid", gap: 6 }}>
                                Expirace (v hodinách)
                                <input value={expiresInHours} onChange={(e) => setExpiresInHours(e.target.value)} />
                            </label>
                        )}

                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={onClose} disabled={busy}>
                                Zavřít
                            </button>
                            <button onClick={createShare} disabled={busy}>
                                Vytvořit
                            </button>
                        </div>

                        {created && (
                            <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
                                <div>
                                    <b>Kód:</b> {created.code}
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <b>Odkaz:</b> {shareUrl}
                                </div>
                                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                                    <button onClick={copyLink}>Kopírovat odkaz</button>
                                </div>
                                {created.expiresAt && (
                                    <div style={{ marginTop: 6, fontSize: 12 }}>
                                        Expiruje: {new Date(created.expiresAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}