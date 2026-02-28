import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiClient } from "../api/apiClient";

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
        } catch (err: any) {
            setMsg(err?.response?.data?.message ?? "Přihlášení selhalo");
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto" }}>
            <h2>Login</h2>
            <ApiAlert type="error" message={msg} onClose={() => setMsg(null)} />

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                />
                <input
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
                <button type="submit">Přihlásit</button>
            </form>
        </div>
    );
}