import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function AdminPage() {
    return (
        <div className="app-page app-page--narrow">
            <PageHeader title="Administrace" subtitle="Správa systému, účtů a bezpečnostních zásahů." />
            <section className="panel stack">
                <div className="panel-header">
                    <div>
                        <h2 className="section-title">Dostupné akce</h2>
                        <p className="section-subtitle">Vstup do přehledu uživatelů, rolí a blokací.</p>
                    </div>
                </div>

                <div className="home-actions">
                    <Link to="/admin/users">
                        <button type="button" className="btn btn--contrast">Správa uživatelů</button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
