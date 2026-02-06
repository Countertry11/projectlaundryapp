"use client";

import { AuthProvider as AuthProviderComponent } from "@/context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthProviderComponent>{children}</AuthProviderComponent>;
}
