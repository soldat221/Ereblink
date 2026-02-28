import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiClient } from "../api/apiClient";
import type { AdminUserDto, Role } from "../types/admin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [msg, setMsg] = useState<string | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const currentUsername = localStorage.getItem("username");

    async function load() {
        const res = await apiClient.get<AdminUserDto[]>("/admin/users");
        setUsers(res.data);
    }

    useEffect(() => {
        load().catch((e: any) => setMsg(e?.response?.data?.message ?? "Chyba při načítání uživatelů"));
    }, []);

    async function setRole(id: number, role: Role) {
        setMsg(null);
        try {
            await apiClient.put(`/admin/users/${id}/role`, { role });
            await load();
            setMsg("Role změněna");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Změna role selhala");
        }
    }

    async function setEnabled(id: number, enabled: boolean) {
        setMsg(null);
        try {
            await apiClient.put(`/admin/users/${id}/enabled`, { enabled });
            await load();
            setMsg("Stav uživatele změněn");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Změna stavu selhala");
        }
    }

    function askDelete(id: number) {
        setDeleteId(id);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (deleteId == null) return;
        setConfirmOpen(false);
        setMsg(null);

        try {
            await apiClient.delete(`/admin/users/${deleteId}`);
            await load();
            setMsg("Uživatel smazán");
        } catch (e: any) {
            setMsg(e?.response?.data?.message ?? "Mazání selhalo");
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
            <h2>Správa uživatelů</h2>
            <div style={{ marginBottom: 12 }}>
                <Link to="/files">← Zpět</Link>
            </div>

            <ApiAlert
                type={
                    msg === "Role změněna" || msg === "Stav uživatele změněn" || msg === "Uživatel smazán"
                        ? "success"
                        : "error"
                }
                message={msg}
                onClose={() => setMsg(null)}
            />

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Username</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Role</th>
                    <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Enabled</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>Akce</th>
                </tr>
                </thead>

                <tbody>
                {users.map((u) => {
                    const isMe = currentUsername === u.username;

                    return (
                        <tr key={u.id}>
                            <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                                {u.username} {isMe ? "(ty)" : ""}
                            </td>

                            <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{u.role}</td>

                            <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                                {u.enabled ? "ANO" : "NE"}
                            </td>

                            <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "center" }}>
                                <button
                                    onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                                    style={{ marginRight: 8 }}
                                    disabled={isMe && u.role === "ADMIN"} // server taky hlídá, jen UX
                                    title={isMe && u.role === "ADMIN" ? "Nemůžeš si odebrat admin roli" : ""}
                                >
                                    {u.role === "ADMIN" ? "Nastavit USER" : "Nastavit ADMIN"}
                                </button>

                                <button
                                    onClick={() => setEnabled(u.id, !u.enabled)}
                                    style={{ marginRight: 8 }}
                                    disabled={isMe && u.enabled}
                                    title={isMe && u.enabled ? "Nemůžeš zakázat sám sebe" : ""}
                                >
                                    {u.enabled ? "Zakázat" : "Povolit"}
                                </button>

                                <button
                                    onClick={() => askDelete(u.id)}
                                    disabled={isMe}
                                    title={isMe ? "Nemůžeš smazat sám sebe" : ""}
                                >
                                    Smazat
                                </button>
                            </td>
                        </tr>
                    );
                })}

                {users.length === 0 && (
                    <tr>
                        <td colSpan={4} style={{ padding: 12 }}>
                            Žádní uživatelé.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <ConfirmDialog
                open={confirmOpen}
                title="Smazat uživatele?"
                text="Opravdu chceš uživatele smazat? (Pozor: může to ovlivnit jeho soubory a vazby.)"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}