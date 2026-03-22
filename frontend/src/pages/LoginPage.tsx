import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import PageHeader from "../components/PageHeader";
import { apiClient } from "../api/apiClient";
import { getApiErrorMessage } from "../utils/apiError";

type LoginResponse = {
    accessToken: string;
    username: string;
    role: "USER" | "ADMIN";
};

export default function LoginPage() {
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);

        try {
            const res = await apiClient.post<LoginResponse>("/auth/login", { username, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("username", res.data.username);
            localStorage.setItem("role", res.data.role);
            nav("/files");
        } catch (err: unknown) {
            setMsg(getApiErrorMessage(err, "Přihlášení selhalo"));
        }
    }

    return (
        <div className="app-page app-page--narrow auth-card">
            <PageHeader title="Přihlášení" subtitle="Přístup ke správě souborů, sdílení a detailům přístupu." />
            <section className="panel stack">
                <ApiAlert type="error" message={msg} onClose={() => setMsg(null)} />

                <form onSubmit={onSubmit} className="stack">
                    <label className="stack">
                        <span>Uživatelské jméno</span>
                        <input
                            className="field"
                            placeholder="Zadej jméno"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </label>
                    <label className="stack">
                        <span>Heslo</span>
                        <input
                            className="field"
                            placeholder="Zadej heslo"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </label>
                    <button type="submit" className="btn btn--primary">Přihlásit se</button>
                </form>

                <Link className="link-muted" to="/register">
                    Nemáš účet? Zaregistruj se
                </Link>
            </section>
        </div>
    );
}
