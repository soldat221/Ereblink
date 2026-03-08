import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function AdminPage() {
    return (
        <div className="stack">
            <PageHeader title="Admin" subtitle="Správa systému a uživatelů." />
            <section className="panel stack">
                <Link to="/admin/users">Správa uživatelů</Link>
            </section>
        </div>
    );
}
