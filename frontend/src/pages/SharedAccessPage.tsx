import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiClient } from "../api/apiClient";

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

    async function load() {
        setMsg(null);
        setInfo(null);

        // 1) zkus veřejné info
        try {
            const res = await apiClient.get<PublicShareInfoResponse>(`/public/share/${code}`);
            setInfo(res.data);
            setMode("public");
            return;
        } catch (e: any) {
            const m = e?.response?.data?.message ?? "Share nelze načíst";
            // když není veřejné, zkus auth variantu pokud je token
            if (!token) {
                setMsg(m + " (Pokud je share omezený, přihlas se.)");
                return;
            }
        }

        // 2) zkus autentizované info
        try {
            const res = await apiClient.get<PublicShareInfoResponse>(`/share/${code}`);
            setInfo(res.data);
            setMode("auth");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Share nelze načíst");
        }
    }

    useEffect(() => {
        if (!code) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    async function download() {
        setMsg(null);
        try {
            const url =
                mode === "public" ? `/public/share/${code}/download` : `/share/${code}/download`;

            const res = await apiClient.get(url, { responseType: "blob" });

            const cd = res.headers["content-disposition"] as string | undefined;
            let filename = info?.originalName ?? "download.bin";
            const match = cd?.match(/filename\*\=UTF-8''([^;]+)/i);
            if (match?.[1]) filename = decodeURIComponent(match[1]);

            const blobUrl = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Download selhal");
        }
    }

    return (
        <div style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
            <h2>Sdílený soubor</h2>

            <ApiAlert type={msg ? "error" : "info"} message={msg} onClose={() => setMsg(null)} />

            {!token && (
                <div style={{ marginBottom: 12, fontSize: 14 }}>
                    <span>Nejsi přihlášený. </span>
                    <Link to="/login">Přihlásit se</Link>
                    <span> (pokud je share omezený).</span>
                </div>
            )}

            {!info ? (
                <div>Načítám…</div>
            ) : (
                <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
                    <div>
                        <b>Soubor:</b> {info.originalName}
                    </div>
                    <div>
                        <b>Typ:</b> {info.contentType}
                    </div>
                    <div>
                        <b>Velikost:</b> {info.size} B
                    </div>
                    <div>
                        <b>Vytvořeno:</b> {new Date(info.createdAt).toLocaleString()}
                    </div>
                    {info.expiresAt && (
                        <div>
                            <b>Expiruje:</b> {new Date(info.expiresAt).toLocaleString()}
                        </div>
                    )}
                    <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={download}>Stáhnout</button>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>
              Režim: {mode === "public" ? "veřejný" : "autentizovaný"}
            </span>
                    </div>
                </div>
            )}
        </div>
    );
}