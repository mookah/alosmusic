"use client";

import Topbar from "./Topbar";
import AuthProvider from "./AuthContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Topbar />
      {children}
    </AuthProvider>
  );
}