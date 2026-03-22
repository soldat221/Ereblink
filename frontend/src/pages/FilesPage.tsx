import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import type { FileItemDto } from "../types/files";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { getApiErrorMessage } from "../utils/apiError";

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
        load().catch((e: unknown) => setMsg(getApiErrorMessage(e, "Chyba při načítání souborů")));
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
        } catch (err: unknown) {
            setMsg(getApiErrorMessage(err, "Upload selhal"));
        } finally {
            setBusy(false);
            e.target.value = "";
        }
    }

    async function downloadFile(id: number) {
        setMsg(null);
        try {
            const res = await apiClient.get(`/files/${id}/download`, { responseType: "blob" });

            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = "download.bin";
            const match = cd?.match(/filename\*=UTF-8''([^;]+)/i);
            if (match?.[1]) filename = decodeURIComponent(match[1]);

            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            setMsg(getApiErrorMessage(err, "Download selhal"));
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
        } catch (err: unknown) {
            setMsg(getApiErrorMessage(err, "Smazání selhalo"));
        } finally {
            setToDeleteId(null);
        }
    }

    return (
        <div className="app-page">
            <PageHeader
                title="Moje soubory"
                subtitle="Nahrávání, stahování a správa souborů v jednom přehledu."
                rightSlot={
                    <Link className="link-muted" to="/shares">
                        Moje sdílení
                    </Link>
                }
            />

            <ApiAlert
                type={msg === "Soubor nahrán" || msg === "Soubor smazán" ? "success" : "error"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            <section className="panel stack">
                <div className="panel-header">
                    <div>
                        <h2 className="section-title">Nahrát nový soubor</h2>
                    </div>
                </div>

                <div className="row">
                    <input type="file" onChange={onUpload} disabled={busy} />
                    {busy ? <span className="page-subtitle">Nahrávám…</span> : null}
                </div>
            </section>

            <section className="panel stack">
                <div className="panel-header">
                    <div>
                        <h2 className="section-title">Přehled souborů</h2>
                        <p className="section-subtitle">Kliknutím na název otevřeš detail, sdílení a metadata.</p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Název</th>
                                <th>Typ</th>
                                <th>Velikost</th>
                                <th>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((f) => (
                                <tr key={f.id}>
                                    <td>
                                        <Link to={`/files/${f.id}`}>{f.originalName}</Link>
                                    </td>
                                    <td>{f.contentType}</td>
                                    <td>{f.size} B</td>
                                    <td className="actions">
                                        <div className="row" style={{ justifyContent: "flex-end" }}>
                                            <button
                                                type="button"
                                                className="btn btn--ghost"
                                                onClick={() => downloadFile(f.id)}
                                            >
                                                Stáhnout
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--danger"
                                                onClick={() => askDelete(f.id)}
                                            >
                                                Smazat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty-state">Zatím tu nic není.</div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>

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
