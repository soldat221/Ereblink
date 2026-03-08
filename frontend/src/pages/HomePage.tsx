import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../components/PageHeader";

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
        <div className="stack">
            <PageHeader
                title="Sdílení souborů bez chaosu"
                subtitle="Nahraj, sdílej a spravuj přístupy jednoduše z mobilu i desktopu."
            />

            <section className="panel hero">
                <form onSubmit={openShare} className="stack">
                    <label className="stack">
                        <span>Otevřít sdílený soubor</span>
                        <input
                            className="field"
                            placeholder="Vlož share kód nebo celý odkaz"
                            value={shareCode}
                            onChange={(e) => setShareCode(e.target.value)}
                        />
                    </label>

                    <div className="hero__cta">
                        <button type="submit" className="btn btn--primary">
                            Otevřít sdílení
                        </button>
                    </div>
                </form>
                <p className="page-subtitle">Tip: stačí vložit i celý link, aplikace si kód vytáhne sama.</p>
            </section>

            {!token ? (
                <section className="panel stack">
                    <h2 style={{ margin: 0 }}>Začni během minuty</h2>
                    <div className="hero__cta">
                        <Link to="/login">
                            <button type="button" className="btn btn--primary">Přihlásit se</button>
                        </Link>
                        <Link to="/register">
                            <button type="button" className="btn btn--ghost">Registrovat</button>
                        </Link>
                    </div>
                </section>
            ) : (
                <section className="panel stack">
                    <h2 style={{ margin: 0 }}>Ahoj, {username}</h2>
                    <div className="hero__cta">
                        <Link to="/files">
                            <button type="button" className="btn btn--primary">Moje soubory</button>
                        </Link>
                        <Link to="/shares">
                            <button type="button" className="btn btn--ghost">Moje share linky</button>
                        </Link>
                        {role === "ADMIN" ? (
                            <Link to="/admin/users">
                                <button type="button" className="btn btn--ghost">Admin panel</button>
                            </Link>
                        ) : null}
                        <button type="button" className="btn btn--danger" onClick={logout}>
                            Odhlásit se
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
