import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../components/PageHeader";

export default function HomePage() {
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const [shareCode, setShareCode] = useState("");

    function openShare(e: React.FormEvent) {
        e.preventDefault();

        let code = shareCode.trim();
        code = code.replace(/^.*\/s\//, "");
        navigate(`/s/${code}`);
    }

    return (
        <div className="home-page">
            <PageHeader
                title="Sdílení souborů bez chaosu"
                subtitle="Nahraj, sdílej a spravuj jednoduše z mobilu i desktopu."
            />

            <section className="panel home-panel home-panel--search">
                <div className="home-panel__header">
                    <h2 className="home-panel__title">Otevřít sdílený soubor</h2>
                    <p className="home-panel__hint">Stačí vložit kód sdílení nebo celý odkaz, aplikace si ho sama rozpozná.</p>
                </div>

                <form onSubmit={openShare} className="home-share-form">
                    <label className="home-share-field">
                        <span className="home-share-field__icon" aria-hidden="true" />
                        <input
                            className="field"
                            placeholder="Vlož kód sdílení nebo celý odkaz"
                            value={shareCode}
                            onChange={(e) => setShareCode(e.target.value)}
                        />
                    </label>

                    <button type="submit" className="btn btn--contrast">
                        Otevřít sdílení
                    </button>
                </form>
            </section>

            {!token ? (
                <section className="panel home-panel home-panel--welcome">
                    <div className="stack">
                        <h2 className="home-panel__title">Začni během minuty</h2>
                        <p className="page-subtitle">Přihlas se a spravuj vlastní soubory i odkazy ke sdílení z jednoho místa.</p>
                    </div>
                    <div className="home-actions">
                        <Link to="/login">
                            <button type="button" className="btn btn--contrast">Přihlásit se</button>
                        </Link>
                        <Link to="/register">
                            <button type="button" className="btn btn--outline">Registrovat</button>
                        </Link>
                    </div>
                </section>
            ) : (
                <section className="panel home-panel home-panel--welcome">
                    <div className="stack">
                        <h2 className="home-panel__title">Ahoj, {username}</h2>
                        <p className="page-subtitle">Spravuj soubory a odkazy ke sdílení.</p>
                    </div>
                    <div className="home-actions">
                        <Link to="/files">
                            <button type="button" className="btn btn--contrast">Moje soubory</button>
                        </Link>
                        <Link to="/shares">
                            <button type="button" className="btn btn--outline">Moje sdílení</button>
                        </Link>
                        {role === "ADMIN" ? (
                            <Link to="/admin/users">
                                <button type="button" className="btn btn--ghost">Admin panel</button>
                            </Link>
                        ) : null}
                    </div>
                </section>
            )}
        </div>
    );
}
