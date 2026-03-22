import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiClient } from "../api/apiClient";
import type { ShareListItemDto } from "../types/shares";
import PageHeader from "../components/PageHeader";
import { getApiErrorMessage } from "../utils/apiError";

function formatAccessType(accessType: string) {
    switch (accessType) {
    case "PUBLIC":
        return "Veřejné";
    case "USER_ONLY":
        return "Jeden uživatel";
    case "LIST":
        return "Seznam uživatelů";
    default:
        return accessType;
    }
}

export default function MySharesPage() {
    const [items, setItems] = useState<ShareListItemDto[]>([]);
    const [msg, setMsg] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    async function load() {
        const res = await apiClient.get<ShareListItemDto[]>("/shares");
        setItems(res.data);
    }

    useEffect(() => {
        load().catch((e: unknown) => setMsg(getApiErrorMessage(e, "Chyba při načítání sdílení")));
    }, []);

    function shareUrl(code: string) {
        return `${window.location.origin}/s/${code}`;
    }

    function askDelete(id: number) {
        setToDeleteId(id);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (toDeleteId == null) return;
        setConfirmOpen(false);
        setMsg(null);

        try {
            await apiClient.delete(`/shares/${toDeleteId}`);
            await load();
            setMsg("Sdílení smazáno");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Smazání selhalo"));
        } finally {
            setToDeleteId(null);
        }
    }

    async function copyLink(code: string) {
        await navigator.clipboard.writeText(shareUrl(code));
        setMsg("Odkaz zkopírován");
    }

    return (
        <div className="app-page">
            <PageHeader
                title="Moje sdílení"
                subtitle="Přehled všech odkazů, expirací a typů přístupu."
                rightSlot={
                    <Link className="link-muted" to="/files">
                        Zpět na soubory
                    </Link>
                }
            />

            <ApiAlert
                type={msg === "Sdílení smazáno" || msg === "Odkaz zkopírován" ? "success" : "error"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            <section className="panel stack">
                <div className="panel-header">
                    <div>
                        <h2 className="section-title">Aktivní sdílení</h2>
                        <p className="section-subtitle">Odkazy můžeš rychle kopírovat nebo okamžitě zrušit.</p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Soubor</th>
                                <th>Typ</th>
                                <th>Kód</th>
                                <th>Expirace</th>
                                <th>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <Link to={`/files/${s.fileId}`}>{s.fileName}</Link>
                                    </td>
                                    <td>{formatAccessType(s.accessType)}</td>
                                    <td>{s.code}</td>
                                    <td>{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "bez expirace"}</td>
                                    <td className="actions">
                                        <div className="row" style={{ justifyContent: "flex-end" }}>
                                            <button
                                                type="button"
                                                className="btn btn--ghost"
                                                onClick={() => copyLink(s.code)}
                                            >
                                                Kopírovat
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--danger"
                                                onClick={() => askDelete(s.id)}
                                            >
                                                Smazat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">Zatím nemáš žádná aktivní sdílení.</div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>

            <ConfirmDialog
                open={confirmOpen}
                title="Smazat sdílení?"
                text="Opravdu chceš sdílení smazat? Přístup přes kód přestane fungovat."
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
