import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import PageHeader from "../components/PageHeader";
import { apiClient } from "../api/apiClient";
import { getApiErrorMessage } from "../utils/apiError";

type RegisterResponse = {
    accessToken: string;
    username: string;
    role: "USER" | "ADMIN";
};

export default function RegisterPage() {
    const nav = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    async function register(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);

        try {
            const res = await apiClient.post<RegisterResponse>("/auth/register", {
                username,
                password,
            });

            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("username", res.data.username);
            localStorage.setItem("role", res.data.role);

            nav("/files");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Registrace selhala"));
        }
    }

    return (
        <div className="app-page app-page--narrow auth-card">
            <PageHeader title="Registrace" subtitle="Vytvoř si účet a začni sdílet během pár sekund." />
            <section className="panel stack">
                <ApiAlert type="error" message={msg} onClose={() => setMsg(null)} />

                <form onSubmit={register} className="stack">
                    <label className="stack">
                        <span>Uživatelské jméno</span>
                        <input
                            className="field"
                            placeholder="Vyber si uživatelské jméno"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </label>

                    <label className="stack">
                        <span>Heslo</span>
                        <input
                            className="field"
                            placeholder="Zadej bezpečné heslo"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </label>

                    <button type="submit" className="btn btn--primary">Vytvořit účet</button>
                </form>

                <Link className="link-muted" to="/login">Už máš účet? Přihlas se</Link>
            </section>
        </div>
    );
}
