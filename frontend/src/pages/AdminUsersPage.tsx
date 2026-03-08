import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiAlert from "../components/ApiAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import { apiClient } from "../api/apiClient";
import type { AdminUserDto, Role } from "../types/admin";
import PageHeader from "../components/PageHeader";
import { getApiErrorMessage } from "../utils/apiError";

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
        load().catch((e: unknown) => setMsg(getApiErrorMessage(e, "Chyba při načítání uživatelů")));
    }, []);

    async function setRole(id: number, role: Role) {
        setMsg(null);
        try {
            await apiClient.put(`/admin/users/${id}/role`, { role });
            await load();
            setMsg("Role změněna");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Změna role selhala"));
        }
    }

    async function setEnabled(id: number, enabled: boolean) {
        setMsg(null);
        try {
            await apiClient.put(`/admin/users/${id}/enabled`, { enabled });
            await load();
            setMsg("Stav uživatele změněn");
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Změna stavu selhala"));
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
        } catch (e: unknown) {
            setMsg(getApiErrorMessage(e, "Mazání selhalo"));
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="stack">
            <PageHeader
                title="Správa uživatelů"
                subtitle="Role, přístupy a bezpečnostní zásahy."
                rightSlot={
                    <Link className="link-muted" to="/files">
                        Zpět na soubory
                    </Link>
                }
            />

            <ApiAlert
                type={
                    msg === "Role změněna" || msg === "Stav uživatele změněn" || msg === "Uživatel smazán"
                        ? "success"
                        : "error"
                }
                message={msg}
                onClose={() => setMsg(null)}
            />

            <section className="panel table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Enabled</th>
                            <th>Akce</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => {
                            const isMe = currentUsername === u.username;

                            return (
                                <tr key={u.id}>
                                    <td>
                                        {u.username} {isMe ? "(ty)" : ""}
                                    </td>
                                    <td>{u.role}</td>
                                    <td>{u.enabled ? "ANO" : "NE"}</td>
                                    <td className="actions">
                                        <div className="row" style={{ justifyContent: "flex-end" }}>
                                            <button
                                                type="button"
                                                className="btn btn--ghost"
                                                onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                                                disabled={isMe && u.role === "ADMIN"}
                                                title={isMe && u.role === "ADMIN" ? "Nemůžeš si odebrat admin roli" : ""}
                                            >
                                                {u.role === "ADMIN" ? "Nastavit USER" : "Nastavit ADMIN"}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn--ghost"
                                                onClick={() => setEnabled(u.id, !u.enabled)}
                                                disabled={isMe && u.enabled}
                                                title={isMe && u.enabled ? "Nemůžeš zakázat sám sebe" : ""}
                                            >
                                                {u.enabled ? "Zakázat" : "Povolit"}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn--danger"
                                                onClick={() => askDelete(u.id)}
                                                disabled={isMe}
                                                title={isMe ? "Nemůžeš smazat sám sebe" : ""}
                                            >
                                                Smazat
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4}>Žádní uživatelé.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </section>

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
