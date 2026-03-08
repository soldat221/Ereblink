import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const [shareCode, setShareCode] = useState("");

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        window.location.reload();
    }

    function openShare(e: React.FormEvent) {
        e.preventDefault();

        let code = shareCode.trim();
        code = code.replace(/^.*\/s\//, "");
        navigate(`/s/${code}`);
    }

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
            <h1>Ereblink</h1>

            <p>
                Aplikace pro sdílení souborů pomocí sdílecích kódů.
            </p>

            {/* vložení share kódu */}
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 20,
                }}
            >
                <h3>Otevřít sdílený soubor</h3>

                <form onSubmit={openShare} style={{ display: "flex", gap: 8 }}>
                    <input
                        placeholder="Zadej share kód"
                        value={shareCode}
                        onChange={(e) => setShareCode(e.target.value)}
                        style={{ flex: 1 }}
                    />

                    <button type="submit">Otevřít</button>
                </form>

                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
                    Můžeš vložit kód nebo odkaz.
                </div>
            </div>

            {/* nepřihlášený */}
            {!token && (
                <div style={{ marginTop: 25 }}>
                    <Link to="/login">
                        <button style={{ marginRight: 10 }}>Přihlásit se</button>
                    </Link>

                    <Link to="/register">
                        <button>Registrovat</button>
                    </Link>
                </div>
            )}

            {/* přihlášený */}
            {token && (
                <div style={{ marginTop: 25 }}>
                    <p>
                        Přihlášen jako: <b>{username}</b>
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link to="/files">
                            <button>Moje soubory</button>
                        </Link>

                        <Link to="/shares">
                            <button>Moje share linky</button>
                        </Link>

                        {role === "ADMIN" && (
                            <Link to="/admin/users">
                                <button>Admin panel</button>
                            </Link>
                        )}

                        <button onClick={logout}>Odhlásit se</button>
                    </div>
                </div>
            )}
        </div>
    );
}