import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import ShareDialog from "../components/ShareDialog";
import { apiClient } from "../api/apiClient";
import type { FileDetailDto } from "../types/files";
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
        load().then(loadShares).catch((e: unknown) => setMsg(getApiErrorMessage(e, "Chyba při načítání detailu")));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileId]);

    async function download() {
        setMsg(null);
        try {
            const res = await apiClient.get(`/files/${fileId}/download`, { responseType: "blob" });

            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = detail?.originalName ?? "download.bin";
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
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Download selhal"));
        }
    }

    async function deleteFile() {
        setConfirmOpen(false);
        setMsg(null);
        try {
            await apiClient.delete(`/files/${fileId}`);
            nav("/files");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Smazání selhalo"));
        }
    }

    function shareUrl(code: string) {
        return `${window.location.origin}/s/${code}`;
    }

    async function copyShare(code: string) {
        await navigator.clipboard.writeText(shareUrl(code));
        setShareMsg("Odkaz zkopírován");
    }

    function askDeleteShare(shareId: number) {
        setShareToDeleteId(shareId);
        setShareDeleteOpen(true);
    }

    async function confirmDeleteShare() {
        if (shareToDeleteId == null) return;
        setShareDeleteOpen(false);
        setShareMsg(null);

        try {
            await apiClient.delete(`/shares/${shareToDeleteId}`);
            await loadShares();
            setShareMsg("Sdílení smazáno");
        } catch (e: unknown) {
            setShareMsg(getApiErrorMessage(e, "Smazání selhalo"));
        } finally {
            setShareToDeleteId(null);
        }
    }

    return (
        <div className="app-page">
            <PageHeader
                title="Detail souboru"
                subtitle="Metadata, akce a správa sdílení na jednom místě."
                rightSlot={
                    <Link className="link-muted" to="/files">
                        Zpět na seznam
                    </Link>
                }
            />

            <ApiAlert type={msg ? "error" : "info"} message={msg} onClose={() => setMsg(null)} />

            {!detail ? (
                <section className="panel">Načítám…</section>
            ) : (
                <>
                    <section className="panel stack">
                        <div className="panel-header">
                            <div>
                                <h2 className="section-title">Základní informace</h2>
                                <p className="section-subtitle">Detail souboru včetně vlastníka, velikosti a času vytvoření.</p>
                            </div>
                        </div>

                        <div className="meta-list">
                            <div>
                                <b>Název:</b> <span>{detail.originalName}</span>
                            </div>
                            <div>
                                <b>Typ:</b> <span>{detail.contentType}</span>
                            </div>
                            <div>
                                <b>Velikost:</b> <span>{detail.size} B</span>
                            </div>
                            <div>
                                <b>Vlastník:</b> <span>{detail.ownerUsername}</span>
                            </div>
                            <div>
                                <b>Vytvořeno:</b> <span>{new Date(detail.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="row">
                            <button type="button" className="btn btn--primary" onClick={() => setShareOpen(true)}>
                                Sdílet
                            </button>
                            <button type="button" className="btn btn--ghost" onClick={download}>
                                Stáhnout
                            </button>
                            <button type="button" className="btn btn--danger" onClick={() => setConfirmOpen(true)}>
                                Smazat
                            </button>
                        </div>
                    </section>

                    <section className="panel stack">
                        <div className="panel-header">
                            <div>
                                <h2 className="section-title">Sdílení souboru</h2>
                                <p className="section-subtitle">Přehled všech aktivních přístupů a rychlé kopírování odkazů.</p>
                            </div>
                        </div>
                        <ApiAlert
                            type={shareMsg === "Sdílení smazáno" || shareMsg === "Odkaz zkopírován" ? "success" : "error"}
                            message={shareMsg}
                            onClose={() => setShareMsg(null)}
                        />

                        {shares.length === 0 ? (
                            <div className="empty-state">Zatím žádná aktivní sdílení.</div>
                        ) : (
                            <div className="table-wrap">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Typ</th>
                                            <th>Kód</th>
                                            <th>Expirace</th>
                                            <th>Akce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shares.map((s) => (
                                            <tr key={s.id}>
                                                <td>{formatAccessType(s.accessType)}</td>
                                                <td>{s.code}</td>
                                                <td>{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "bez expirace"}</td>
                                                <td className="actions">
                                                    <div className="row" style={{ justifyContent: "flex-end" }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn--ghost"
                                                            onClick={() => copyShare(s.code)}
                                                        >
                                                            Kopírovat
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn--danger"
                                                            onClick={() => askDeleteShare(s.id)}
                                                        >
                                                            Smazat
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <ConfirmDialog
                        open={shareDeleteOpen}
                        title="Smazat sdílení?"
                        text="Opravdu chceš sdílení smazat? Přístup přes kód přestane fungovat."
                        onCancel={() => setShareDeleteOpen(false)}
                        onConfirm={confirmDeleteShare}
                    />
                </>
            )}

            {detail ? (
                <ShareDialog
                    open={shareOpen}
                    fileId={detail.id}
                    onClose={() => setShareOpen(false)}
                    onCreated={() => {
                        loadShares();
                        setShareOpen(false);
                    }}
                />
            ) : null}

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
