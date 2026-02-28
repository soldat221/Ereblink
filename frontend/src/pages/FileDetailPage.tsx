import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareDialog from "../components/ShareDialog";
import { apiClient } from "../api/apiClient";
import type { FileDetailDto } from "../types/files";
import type { ShareListItemDto } from "../types/shares";

export default function FileDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();

    const fileId = Number(id);
    const [detail, setDetail] = useState<FileDetailDto | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [shares, setShares] = useState<ShareListItemDto[]>([]);
    const [shareMsg, setShareMsg] = useState<string | null>(null);
    const [shareDeleteOpen, setShareDeleteOpen] = useState(false);
    const [shareToDeleteId, setShareToDeleteId] = useState<number | null>(null);

    async function load() {
        const res = await apiClient.get<FileDetailDto>(`/files/${fileId}`);
        setDetail(res.data);
    }

    async function loadShares() {
        const res = await apiClient.get<ShareListItemDto[]>(`/files/${fileId}/shares`);
        setShares(res.data);
    }

    useEffect(() => {
        if (!Number.isFinite(fileId) || fileId <= 0) {
            setMsg("Neplatné ID souboru");
            return;
        }
        load().then(loadShares).catch((e: any) => setMsg(e?.response?.data?.message ?? "Chyba při načítání detailu"));
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

    function shareUrl(code: string) {
        return `${window.location.origin}/s/${code}`;
    }

    async function copyShare(code: string) {
        await navigator.clipboard.writeText(shareUrl(code));
        setShareMsg("Odkaz zkopírován");
    }

    function askDeleteShare(id: number) {
        setShareToDeleteId(id);
        setShareDeleteOpen(true);
    }

    async function confirmDeleteShare() {
        if (shareToDeleteId == null) return;
        setShareDeleteOpen(false);
        setShareMsg(null);

        try {
            await apiClient.delete(`/shares/${shareToDeleteId}`);
            await loadShares();
            setShareMsg("Share smazán");
        } catch (e: any) {
            setShareMsg(e?.response?.data?.message ?? "Smazání selhalo");
        } finally {
            setShareToDeleteId(null);
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

                    <div style={{ marginTop: 18 }}>
                        <h3 style={{ marginTop: 0 }}>Share linky</h3>

                        <ApiAlert
                            type={shareMsg === "Share smazán" || shareMsg === "Odkaz zkopírován" ? "success" : "error"}
                            message={shareMsg}
                            onClose={() => setShareMsg(null)}
                        />

                        {shares.length === 0 ? (
                            <div style={{ fontSize: 14, opacity: 0.8 }}>Zatím žádné share linky.</div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                                <thead>
                                <tr>
                                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Typ</th>
                                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Kód</th>
                                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Expirace</th>
                                    <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Akce</th>
                                </tr>
                                </thead>
                                <tbody>
                                {shares.map((s) => (
                                    <tr key={s.id}>
                                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{s.accessType}</td>
                                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{s.code}</td>
                                        <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                                            {s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "bez expirace"}
                                        </td>
                                        <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "center" }}>
                                            <button onClick={() => copyShare(s.code)} style={{ marginRight: 8 }}>Kopírovat</button>
                                            <button onClick={() => askDeleteShare(s.id)}>Smazat</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <ConfirmDialog
                        open={shareDeleteOpen}
                        title="Smazat share?"
                        text="Opravdu chceš share smazat? Přístup přes kód přestane fungovat."
                        onCancel={() => setShareDeleteOpen(false)}
                        onConfirm={confirmDeleteShare}
                    />
                </div>
            )}

            {detail && (
                <ShareDialog
                    open={shareOpen}
                    fileId={detail.id}
                    onClose={() => setShareOpen(false)}
                    onCreated={() => {
                        loadShares();
                        setShareOpen(false);
                    }}
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