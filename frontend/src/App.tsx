import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FilesPage from "./pages/FilesPage";
import FileDetailPage from "./pages/FileDetailPage";
import SharedAccessPage from "./pages/SharedAccessPage";
import AdminPage from "./pages/AdminPage";
import MySharesPage from "./pages/MySharesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import React from "react";

type ProtectedRouteProps = { children: React.ReactNode };

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("accessToken");
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    if (!token) return <Navigate to="/login" replace />;
    return role === "ADMIN" ? <>{children}</> : <Navigate to="/files" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/files"
                element={
                    <ProtectedRoute>
                        <FilesPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/files/:id"
                element={
                    <ProtectedRoute>
                        <FileDetailPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/shares"
                element={
                    <ProtectedRoute>
                        <MySharesPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <AdminUsersPage />
                    </AdminRoute>
                }
            />

            <Route path="/s/:code" element={<SharedAccessPage />} />
            <Route path="*" element={<Navigate to="/files" replace />} />
        </Routes>
    );
}