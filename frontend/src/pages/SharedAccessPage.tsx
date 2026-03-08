import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiClient } from "../api/apiClient";
import PageHeader from "../components/PageHeader";
import { getApiErrorMessage } from "../utils/apiError";

type PublicShareInfoResponse = {
    code: string;
    fileId: number;
    originalName: string;
    contentType: string;
    size: number;
    createdAt: string;
    expiresAt: string | null;
};

export default function SharedAccessPage() {
    const { code } = useParams();
    const [info, setInfo] = useState<PublicShareInfoResponse | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [mode, setMode] = useState<"public" | "auth">("public");

    const token = localStorage.getItem("accessToken");

    const load = useCallback(async () => {
        setMsg(null);
        setInfo(null);

        try {
            const res = await apiClient.get<PublicShareInfoResponse>(`/public/share/${code}`);
            setInfo(res.data);
            setMode("public");
            return;
        } catch (e: unknown) {
            const m = getApiErrorMessage(e, "Share nelze načíst");
            if (!token) {
                setMsg(`${m} (Pokud je share omezený, přihlas se.)`);
                return;
            }
        }

        try {
            const res = await apiClient.get<PublicShareInfoResponse>(`/share/${code}`);
            setInfo(res.data);
            setMode("auth");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Share nelze načíst"));
        }
    }, [code, token]);

    useEffect(() => {
        if (!code) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [code, load]);

    async function download() {
        setMsg(null);
        try {
            const url = mode === "public" ? `/public/share/${code}/download` : `/share/${code}/download`;
            const res = await apiClient.get(url, { responseType: "blob" });

            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = info?.originalName ?? "download.bin";
            const match = cd?.match(/filename\*=UTF-8''([^;]+)/i);
            if (match?.[1]) filename = decodeURIComponent(match[1]);

            const blobUrl = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Download selhal"));
        }
    }

    return (
        <div className="stack">
            <PageHeader title="Sdílený soubor" subtitle="Přístup přes veřejný nebo autorizovaný režim." />
            <ApiAlert type={msg ? "error" : "info"} message={msg} onClose={() => setMsg(null)} />

            {!token ? (
                <section className="panel">
                    Nejsi přihlášený. <Link to="/login">Přihlásit se</Link> (pokud je share omezený).
                </section>
            ) : null}

            {!info ? (
                <section className="panel">Načítám…</section>
            ) : (
                <section className="panel stack">
                    <div className="meta-list">
                        <div>
                            <b>Soubor:</b> <span>{info.originalName}</span>
                        </div>
                        <div>
                            <b>Typ:</b> <span>{info.contentType}</span>
                        </div>
                        <div>
                            <b>Velikost:</b> <span>{info.size} B</span>
                        </div>
                        <div>
                            <b>Vytvořeno:</b> <span>{new Date(info.createdAt).toLocaleString()}</span>
                        </div>
                        {info.expiresAt ? (
                            <div>
                                <b>Expiruje:</b> <span>{new Date(info.expiresAt).toLocaleString()}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="row">
                        <button type="button" className="btn btn--primary" onClick={download}>
                            Stáhnout
                        </button>
                        <span className="pill">Režim: {mode === "public" ? "veřejný" : "autentizovaný"}</span>
                    </div>
                </section>
            )}
        </div>
    );
}
