import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareDialog from "../components/ShareDialog";
import { apiClient } from "../api/apiClient";
import type { FileDetailDto } from "../types/files";

export default function FileDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();

    const fileId = Number(id);
    const [detail, setDetail] = useState<FileDetailDto | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    async function load() {
        const res = await apiClient.get<FileDetailDto>(`/files/${fileId}`);
        setDetail(res.data);
    }

    useEffect(() => {
        if (!Number.isFinite(fileId) || fileId <= 0) {
            setMsg("Neplatné ID souboru");
            return;
        }
        load().catch((e: any) => setMsg(e?.response?.data?.message ?? "Chyba při načítání detailu"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileId]);

    async function download() {
        setMsg(null);
        try {
            const res = await apiClient.get(`/files/${fileId}/download`, { responseType: "blob" });

            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = detail?.originalName ?? "download.bin";
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
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Download selhal");
        }
    }

    async function deleteFile() {
        setConfirmOpen(false);
        setMsg(null);
        try {
            await apiClient.delete(`/files/${fileId}`);
            nav("/files");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Smazání selhalo");
        }
    }

    return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ marginBottom: 12 }}>
                <Link to="/files">← Zpět na seznam</Link>
            </div>

            <h2>Detail souboru</h2>

            <ApiAlert
                type={msg ? "error" : "info"}
                message={msg}
                onClose={() => setMsg(null)}
            />

            {!detail ? (
                <div>Načítám…</div>
            ) : (
                <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "grid", gap: 8 }}>
                        <div>
                            <b>Název:</b> {detail.originalName}
                        </div>
                        <div>
                            <b>Typ:</b> {detail.contentType}
                        </div>
                        <div>
                            <b>Velikost:</b> {detail.size} B
                        </div>
                        <div>
                            <b>Vlastník:</b> {detail.ownerUsername}
                        </div>
                        <div>
                            <b>Vytvořeno:</b> {new Date(detail.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button onClick={() => setShareOpen(true)}>Sdílet</button>
                        <button onClick={download}>Stáhnout</button>
                        <button onClick={() => setConfirmOpen(true)}>Smazat</button>
                    </div>
                </div>
            )}

            {detail && (
                <ShareDialog
                    open={shareOpen}
                    fileId={detail.id}
                    onClose={() => setShareOpen(false)}
                />
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Smazat soubor?"
                text="Opravdu chceš soubor smazat? Tato akce je nevratná."
                onCancel={() => setConfirmOpen(false)}
                onConfirm={deleteFile}
            />
        </div>
    );
}