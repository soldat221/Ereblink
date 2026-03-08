import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import { apiClient } from "../api/apiClient";

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
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Registrace selhala");
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto" }}>
            <h2>Registrace</h2>

            <ApiAlert type="error" message={msg} onClose={() => setMsg(null)} />

            <form onSubmit={register} style={{ display: "grid", gap: 12 }}>
                <input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Registrovat</button>
            </form>

            <div style={{ marginTop: 10 }}>
                <Link to="/login">Už máš účet? Přihlas se</Link>
            </div>
        </div>
    );
}