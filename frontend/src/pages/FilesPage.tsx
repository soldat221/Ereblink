import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import type { FileItemDto } from "../types/files";
import { Link } from "react-router-dom";

export default function FilesPage() {
    const [files, setFiles] = useState<FileItemDto[]>([]);
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    async function load() {
        const res = await apiClient.get<FileItemDto[]>("/files");
        setFiles(res.data);
    }

    useEffect(() => {
        load().catch((e: any) => setMsg(e?.response?.data?.message ?? "Chyba při načítání souborů"));
    }, []);

    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;

        setMsg(null);
        setBusy(true);

        try {
            const form = new FormData();
            form.append("file", f);

            await apiClient.post("/files", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await load();
            setMsg("Soubor nahrán");
        } catch (err: any) {
            setMsg(err?.response?.data?.message ?? "Upload selhal");
        } finally {
            setBusy(false);
            e.target.value = ""; // aby šlo nahrát znovu stejný soubor
        }
    }

    async function downloadFile(id: number) {
        setMsg(null);
        try {
            const res = await apiClient.get(`/files/${id}/download`, { responseType: "blob" });

            // Zkus vytáhnout filename z Content-Disposition
            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = "download.bin";
            const match = cd?.match(/filename\*\=UTF-8''([^;]+)/i);
            if (match?.[1]) filename = decodeURIComponent(match[1]);

            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setMsg(err?.response?.data?.message ?? "Download selhal");
        }
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
            await apiClient.delete(`/files/${toDeleteId}`);
            await load();
            setMsg("Soubor smazán");
        } catch (err: any) {
            setMsg(err?.response?.data?.message ?? "Smazání selhalo");
        } finally {
            setToDeleteId(null);
        }
    }

    return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
            <h2>Moje soubory</h2>

            <div style={{ marginBottom: 12 }}>
                <Link to="/shares" style={{ marginLeft: 12 }}>Moje share linky</Link>
            </div>

            <ApiAlert
                type={msg === "Soubor nahrán" || msg === "Soubor smazán" ? "success" : "error"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <input type="file" onChange={onUpload} disabled={busy} />
                {busy && <span>Nahrávám…</span>}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Název</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Typ</th>
                    <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Velikost</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Akce</th>
                </tr>
                </thead>
                <tbody>
                {files.map((f) => (
                    <tr key={f.id}>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                            <Link to={`/files/${f.id}`}>{f.originalName}</Link>
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{f.contentType}</td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right" }}>
                            {f.size} B
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "center" }}>
                            <button onClick={() => downloadFile(f.id)} style={{ marginRight: 8 }}>
                                Stáhnout
                            </button>
                            <button onClick={() => askDelete(f.id)}>Smazat</button>
                        </td>
                    </tr>
                ))}
                {files.length === 0 && (
                    <tr>
                        <td colSpan={4} style={{ padding: 12 }}>
                            Zatím tu nic není.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <ConfirmDialog
                open={confirmOpen}
                title="Smazat soubor?"
                text="Opravdu chceš soubor smazat? Tato akce je nevratná."
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}