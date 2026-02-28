import { Link } from "react-router-dom";

export default function AdminPage() {
    return (
        <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
            <h2>Admin</h2>
            <ul>
                <li>
                    <Link to="/admin/users">Správa uživatelů</Link>
                </li>
            </ul>
        </div>
    );
}