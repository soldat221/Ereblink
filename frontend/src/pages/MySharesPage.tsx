import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiClient } from "../api/apiClient";
import type { ShareListItemDto } from "../types/shares";
import PageHeader from "../components/PageHeader";
import { getApiErrorMessage } from "../utils/apiError";

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
        load().catch((e: unknown) => setMsg(getApiErrorMessage(e, "Chyba při načítání share linků")));
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
            setMsg("Share smazán");
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
        <div className="stack">
            <PageHeader
                title="Moje share linky"
                subtitle="Přehled všech sdílení a rychlé kopírování odkazů."
                rightSlot={
                    <Link className="link-muted" to="/files">
                        Zpět na soubory
                    </Link>
                }
            />

            <ApiAlert
                type={msg === "Share smazán" || msg === "Odkaz zkopírován" ? "success" : "error"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            <section className="panel table-wrap">
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
                                <td>{s.accessType}</td>
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
                                <td colSpan={5}>Zatím nemáš žádné share linky.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </section>

            <ConfirmDialog
                open={confirmOpen}
                title="Smazat share?"
                text="Opravdu chceš share smazat? Přístup přes kód přestane fungovat."
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
