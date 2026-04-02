"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  LayoutGrid,
  Loader2,
  User,
  Save,
  Store,
  Eye,
  EyeOff,
} from "lucide-react";
import { User as UserType, Outlet } from "@/types";
import { AnimatedPage, AnimatedItem } from "@/components/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { resolveAdminUserDeleteGuard } from "@/lib/adminUserDeleteGuard.mjs";
import {
  getAllowedAdminUserRoles,
  isAdminUserRoleLocked,
  resolveAdminUserSubmitRole,
} from "@/lib/adminUserRoleGuard.mjs";
import { normalizeDisplayValue } from "@/lib/adminDuplicateValidation.mjs";
import { getAdminUserDuplicateMessage } from "@/lib/adminUserDuplicateValidation.mjs";
import { resolveKasirOutletAccess } from "@/lib/kasirOutletAccess.mjs";
import { sanitizePhoneNumber } from "@/utils";

type UserPayload = {
  full_name: string;
  username: string;
  password?: string;
  phone: string;
  role: UserType["role"];
  outlet_id: string | null;
  is_active?: boolean;
  updated_at?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

export default function AdminUserPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [formError, setFormError] = useState("");
  const [originalRole, setOriginalRole] = useState<UserType["role"] | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    phone: "",
    role: "kasir" as "admin" | "kasir" | "owner",
    outlet_id: "" as string,
  });

  const primaryOutlet =
    outlets.find((outlet) =>
      outlet.name.toLowerCase().includes("utama"),
    ) || outlets[0] || null;

  const secondaryOutlet =
    outlets.find((outlet) => {
      const outletName = outlet.name.toLowerCase();
      return (
        outletName.includes("laundry 2") ||
        outletName.includes("laundry dua") ||
        outletName.includes("cabang 2") ||
        outletName.includes("cabang dua") ||
        outletName.includes("branch 2")
      );
    }) ||
    outlets.find((outlet) => outlet.id !== primaryOutlet?.id) ||
    null;

  const roleOptionLabels: Record<UserType["role"], string> = {
    admin: "Administrator",
    kasir: "Kasir",
    owner: "Pemilik",
  };

  const allowedRoles = getAllowedAdminUserRoles({
    isEditMode,
    originalRole,
  }) as UserType["role"][];
  const roleLocked = isAdminUserRoleLocked({
    isEditMode,
    originalRole,
  });

  function isBardiIdentity(fullName?: string, username?: string) {
    const identity = `${fullName || ""} ${username || ""}`.toLowerCase();
    return identity.includes("bardi");
  }

  function getCashierDefaultOutlet(fullName?: string, username?: string) {
    if (isBardiIdentity(fullName, username)) {
      return primaryOutlet;
    }

    return secondaryOutlet || primaryOutlet;
  }

  function getDefaultOutletId(
    role: UserType["role"],
    fullName?: string,
    username?: string,
  ) {
    if (role === "kasir") {
      return getCashierDefaultOutlet(fullName, username)?.id || "";
    }

    return "";
  }

  function getCashierDefaultOutletLabel(fullName?: string, username?: string) {
    return (
      getCashierDefaultOutlet(fullName, username)?.name ||
      (isBardiIdentity(fullName, username)
        ? "Bardi Laundry Utama"
        : "Laundry 2")
    );
  }

  function getResolvedOutletLabel(user: UserType) {
    if (user.role !== "kasir") {
      return "";
    }

    return resolveKasirOutletAccess(outlets, user.outlet_id).displayLabel;
  }

  function getUserById(userId: string) {
    return users.find((user) => user.id === userId) || null;
  }

  function getDeleteGuard(targetUser: UserType | null | undefined) {
    return resolveAdminUserDeleteGuard({
      currentUser,
      targetUser,
    });
  }

  function canDeleteUser(targetUser: UserType) {
    return getDeleteGuard(targetUser).canDelete;
  }

  function openDeleteModal(targetUser: UserType) {
    const deleteGuard = getDeleteGuard(targetUser);

    if (!deleteGuard.canDelete) {
      alert(deleteGuard.message);
      return;
    }

    setDeleteConfirm(targetUser.id);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);

      // Fetch outlets
      const { data: outletData } = await supabase
        .from("outlets")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setOutlets(outletData || []);
    } catch (error: unknown) {
      console.error("Gagal ambil data:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  function resetForm() {
    setFormData({
      full_name: "",
      username: "",
      password: "",
      phone: "",
      role: "kasir",
      outlet_id: getDefaultOutletId("kasir"),
    });
    setIsEditMode(false);
    setEditingId(null);
    setOriginalRole(null);
    setRoleError("");
    setFormError("");
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(user: UserType) {
    setRoleError("");
    setFormError("");
    setFormData({
      full_name: user.full_name || "",
      username: user.username,
      password: "", // Don't show existing password
      phone: sanitizePhoneNumber(user.phone),
      role: user.role,
      outlet_id:
        user.role === "kasir"
          ? user.outlet_id ||
            getDefaultOutletId(user.role, user.full_name, user.username)
          : "",
    });
    setOriginalRole(user.role);
    setEditingId(user.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const roleGuard = resolveAdminUserSubmitRole({
      isEditMode,
      originalRole,
      requestedRole: formData.role,
    });
    const resolvedRole = roleGuard.role as UserType["role"];
    const normalizedFullName = normalizeDisplayValue(formData.full_name);
    const sanitizedPhone = sanitizePhoneNumber(formData.phone);

    if (!roleGuard.isValid) {
      setRoleError(roleGuard.message || "");
      setSaving(false);
      alert("Error: " + roleGuard.message);
      return;
    }

    setRoleError("");
    setFormError("");
    const resolvedOutletId =
      resolvedRole === "kasir"
        ? formData.outlet_id ||
          getDefaultOutletId(
            resolvedRole,
            formData.full_name,
            formData.username,
          )
        : "";

    try {
      const { data: existingUsers, error: duplicateError } = await supabase
        .from("users")
        .select("id, full_name, phone")
        .eq("is_active", true);

      if (duplicateError) throw duplicateError;

      const duplicateMessage = getAdminUserDuplicateMessage(
        existingUsers || [],
        {
          full_name: normalizedFullName,
          phone: sanitizedPhone,
        },
        {
          excludeId: editingId,
        },
      );

      if (duplicateMessage) {
        setFormError(duplicateMessage);
        alert(duplicateMessage);
        return;
      }

      if (isEditMode && editingId) {
        // Update existing user
        const updateData: UserPayload = {
          full_name: normalizedFullName,
          username: formData.username,
          phone: sanitizedPhone,
          role: resolvedRole,
          outlet_id: resolvedOutletId || null,
          updated_at: new Date().toISOString(),
        };

        // Only update password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", editingId);

        if (error) throw error;
        alert("Pengguna berhasil diperbarui!");
      } else {
        // Create new user
        const { error } = await supabase.from("users").insert([
          {
            full_name: normalizedFullName,
            username: formData.username,
            password: formData.password,
            phone: sanitizedPhone,
            role: resolvedRole,
            outlet_id: resolvedOutletId || null,
            is_active: true,
          },
        ]);

        if (error) throw error;
        alert("Pengguna berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      alert("Error: " + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const targetUser = getUserById(id);
      const deleteGuard = getDeleteGuard(targetUser);

      if (!deleteGuard.canDelete) {
        setDeleteConfirm(null);
        alert("Error: " + deleteGuard.message);
        return;
      }

      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) throw error;

      alert("Pengguna berhasil dihapus!");
      setDeleteConfirm(null);
      fetchData();
    } catch (error: unknown) {
      alert("Error: " + getErrorMessage(error));
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header Card */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 self-start">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center animate-scaleIn">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 animate-slideInRight" style={{ animationDelay: '100ms' }}>
              Kelola Pengguna
            </h1>
            <p className="text-slate-500 text-sm animate-slideInRight" style={{ animationDelay: '200ms' }}>
              Daftar semua pengguna sistem (Admin, Kasir, Owner)
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-100 w-full md:w-auto justify-center animate-scaleIn" style={{ animationDelay: '300ms' }}
        >
          <Plus size={20} /> Tambah Pengguna
        </button>
      </div>

      {/* Table */}
      <AnimatedItem animation="fadeInUp" style={{ animationDelay: '400ms' }} className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header with Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3 self-start">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-100 flex items-center justify-center">
              <LayoutGrid className="text-white" size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              Daftar Pengguna
            </h3>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Nama Lengkap</th>
                <th className="px-8 py-5">Pengguna</th>
                <th className="px-8 py-5">No. Telepon</th>
                <th className="px-8 py-5 text-center">Peran</th>
                <th className="px-8 py-5 text-center">Outlet</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={40}
                    />
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u, index) => (
                  <AnimatedItem
                    as="tr"
                    key={u.id}
                    animation="slideInLeft"
                    index={index}
                    staggerDelay={50}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-8 py-5 font-bold text-slate-800">
                      {u.full_name}
                    </td>
                    <td className="px-8 py-5 text-blue-600 font-semibold italic">
                      {u.username}
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                      {u.phone || "-"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-rose-100 text-rose-600 border border-rose-200"
                            : u.role === "kasir"
                              ? "bg-blue-100 text-blue-600 border border-blue-200"
                              : "bg-amber-100 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {getResolvedOutletLabel(u) ? (
                        <span className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {getResolvedOutletLabel(u)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={18} />
                        </button>
                        {canDeleteUser(u) ? (
                          <button
                            onClick={() => openDeleteModal(u)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </AnimatedItem>
                ))
              ) : (
                <tr>
                   <td
                    colSpan={7}
                    className="py-20 text-center text-slate-400 text-sm font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                       <Search className="w-10 h-10 text-slate-300 mb-2" />
                       Data tidak ditemukan.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AnimatedItem>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                  setShowPassword(false);
                }}
                className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
            >
              {formError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                  {formError}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Nama Lengkap *
                </label>
                <input
                  required
                  placeholder="Contoh: Admin Utama"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormError("");
                    setFormData((prev) => {
                      const nextFullName = e.target.value;
                      const shouldSyncOutlet =
                        prev.role === "kasir" &&
                        (!prev.outlet_id ||
                          prev.outlet_id ===
                            getDefaultOutletId(
                              prev.role,
                              prev.full_name,
                              prev.username,
                            ));

                      return {
                        ...prev,
                        full_name: nextFullName,
                        outlet_id: shouldSyncOutlet
                          ? getDefaultOutletId(
                              prev.role,
                              nextFullName,
                              prev.username,
                            )
                          : prev.outlet_id,
                      };
                    });
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Pengguna *
                </label>
                <input
                  required
                  placeholder="Pengguna login"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const nextUsername = e.target.value;
                      const shouldSyncOutlet =
                        prev.role === "kasir" &&
                        (!prev.outlet_id ||
                          prev.outlet_id ===
                            getDefaultOutletId(
                              prev.role,
                              prev.full_name,
                              prev.username,
                            ));

                      return {
                        ...prev,
                        username: nextUsername,
                        outlet_id: shouldSyncOutlet
                          ? getDefaultOutletId(
                              prev.role,
                              prev.full_name,
                              nextUsername,
                            )
                          : prev.outlet_id,
                      };
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Kata Sandi{" "}
                  {isEditMode ? "(kosongkan jika tidak ingin mengubah)" : "*"}
                </label>
                <div className="relative">
                  <input
                    required={!isEditMode}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormError("");
                      setFormData({
                        ...formData,
                        phone: sanitizePhoneNumber(e.target.value),
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Peran *
                  </label>
                  <select
                    className={`w-full px-5 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm appearance-none font-bold transition-all ${
                      roleLocked
                        ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
                        : "border border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-500"
                    }`}
                    value={formData.role}
                    disabled={roleLocked}
                    onChange={(e) => {
                      setRoleError("");
                      const nextRole = e.target.value as UserType["role"];

                      if (!allowedRoles.includes(nextRole)) {
                        return;
                      }

                      setFormData((prev) => ({
                        ...prev,
                        role: nextRole,
                        outlet_id:
                          nextRole === "kasir"
                            ? prev.outlet_id ||
                              getDefaultOutletId(
                                nextRole,
                                prev.full_name,
                                prev.username,
                              )
                            : "",
                      }));
                    }}
                  >
                    {allowedRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleOptionLabels[role]}
                      </option>
                    ))}
                  </select>
                  {roleError ? (
                    <p className="text-xs font-medium text-rose-500">{roleError}</p>
                  ) : null}
                </div>
              </div>

              {/* Outlet Selection - Only for Kasir */}
              {formData.role === "kasir" && (
                <AnimatedItem animation="fadeInUp" className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    {getCashierDefaultOutletLabel(
                      formData.full_name,
                      formData.username,
                    )}
                  </div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1 flex items-center gap-2">
                    <Store size={12} /> Toko
                  </label>
                  <select
                    className="w-full px-5 py-3.5 bg-white border border-blue-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm appearance-none font-bold text-slate-700"
                    value={formData.outlet_id}
                    onChange={(e) =>
                      setFormData({ ...formData, outlet_id: e.target.value })
                    }
                  >
                    <option value="">-- Pilih Toko --</option>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-500 ml-1 font-medium">
                    Kasir Bardi tetap di Laundry Utama. Kasir lain default ke
                    Laundry 2, tetapi masih bisa Anda ubah bila diperlukan.
                  </p>
                </AnimatedItem>
              )}

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isEditMode ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Trash2 className="text-rose-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Hapus Pengguna?
            </h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Pengguna akan dinonaktifkan dan tidak bisa login lagi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
