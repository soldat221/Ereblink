import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiClient } from "../api/apiClient";
import type { ShareListItemDto } from "../types/shares";

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
        load().catch((e: any) => setMsg(e?.response?.data?.message ?? "Chyba při načítání share linků"));
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
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Smazání selhalo");
        } finally {
            setToDeleteId(null);
        }
    }

    async function copyLink(code: string) {
        await navigator.clipboard.writeText(shareUrl(code));
        setMsg("Odkaz zkopírován");
    }

    return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
            <h2>Moje share linky</h2>
            <div style={{ marginBottom: 12 }}>
                <Link to="/files">← Zpět na soubory</Link>
            </div>

            <ApiAlert
                type={msg === "Share smazán" || msg === "Odkaz zkopírován" ? "success" : "error"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Soubor</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Typ</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Kód</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Expirace</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Akce</th>
                </tr>
                </thead>
                <tbody>
                {items.map((s) => (
                    <tr key={s.id}>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                            <Link to={`/files/${s.fileId}`}>{s.fileName}</Link>
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{s.accessType}</td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{s.code}</td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                            {s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "bez expirace"}
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "center" }}>
                            <button onClick={() => copyLink(s.code)} style={{ marginRight: 8 }}>Kopírovat</button>
                            <button onClick={() => askDelete(s.id)}>Smazat</button>
                        </td>
                    </tr>
                ))}
                {items.length === 0 && (
                    <tr>
                        <td colSpan={5} style={{ padding: 12 }}>
                            Zatím nemáš žádné share linky.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

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