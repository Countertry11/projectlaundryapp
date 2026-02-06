"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "kasir" | "owner";

interface User {
    id: string;
    username: string;
    role: UserRole;
    full_name: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("laundry_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("laundry_user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Query user from database
            const { data, error } = await supabase
                .from("users")
                .select("id, username, role, full_name, email, password")
                .eq("username", username)
                .eq("is_active", true)
                .single();

            if (error || !data) {
                return { success: false, error: "Username tidak ditemukan" };
            }

            // Simple password check (untuk development)
            // Di production, gunakan bcrypt atau API route untuk validasi
            // Untuk sekarang, kita cek apakah password cocok dengan yang di-hash atau plain text
            const isPasswordMatch = data.password === password // Bypass untuk demo jika password di-hash

            if (!isPasswordMatch) {
                return { success: false, error: "Password salah" };
            }

            // Create user object (exclude password)
            const userData: User = {
                id: data.id,
                username: data.username,
                role: data.role as UserRole,
                full_name: data.full_name,
                email: data.email,
            };

            // Save to state and localStorage
            setUser(userData);
            localStorage.setItem("laundry_user", JSON.stringify(userData));

            return { success: true };
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, error: "Terjadi kesalahan saat login" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("laundry_user");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
