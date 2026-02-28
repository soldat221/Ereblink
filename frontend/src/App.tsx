import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FilesPage from "./pages/FilesPage";
import FileDetailPage from "./pages/FileDetailPage";
import SharedAccessPage from "./pages/SharedAccessPage";
import AdminPage from "./pages/AdminPage";
import MySharesPage from "./pages/MySharesPage";
import React from "react";

type ProtectedRouteProps = { children: React.ReactNode };

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = localStorage.getItem("accessToken");
    return token ? <>{children}</> : <Navigate to="/login" replace />;
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
                    <ProtectedRoute>
                        <AdminPage />
                    </ProtectedRoute>
                }
            />

            <Route path="/s/:code" element={<SharedAccessPage />} />
            <Route path="*" element={<Navigate to="/files" replace />} />
        </Routes>
    );
}