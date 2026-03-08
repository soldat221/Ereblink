import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../../hooks/useTheme";

type NavItem = {
    to: string;
    label: string;
};

export default function AppShell() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const guestNav: NavItem[] = [
        { to: "/", label: "Domů" },
        { to: "/login", label: "Přihlášení" },
        { to: "/register", label: "Registrace" },
    ];

    const userNav: NavItem[] = [
        { to: "/", label: "Domů" },
        { to: "/files", label: "Soubory" },
        { to: "/shares", label: "Share linky" },
        ...(role === "ADMIN" ? [{ to: "/admin/users", label: "Admin" }] : []),
    ];

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/");
        window.location.reload();
    }

    const navItems = token ? userNav : guestNav;

    return (
        <div className="app-shell">
            <header className="app-shell__header">
                <div className="container app-shell__header-content">
                    <button
                        type="button"
                        className="brand"
                        onClick={() => navigate("/")}
                        aria-label="Přejít na domovskou stránku"
                    >
                        <img src={logo} alt="Ereblink" className="brand__logo" />
                        <div>
                            <div className="brand__name">Ereblink</div>
                        </div>
                    </button>

                    {token && (
                        <div className="app-shell__userbar">
                            <span className="pill">{username}</span>
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            <button type="button" className="btn btn--ghost" onClick={logout}>Odhlásit</button>
                        </div>
                    )}
                    {!token && (
                        <div className="app-shell__userbar">
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                        </div>
                    )}
                </div>

                <div className="container">
                    <nav className="app-shell__nav" aria-label="Hlavní navigace">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `app-shell__nav-link${isActive ? " app-shell__nav-link--active" : ""}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="app-shell__main">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
