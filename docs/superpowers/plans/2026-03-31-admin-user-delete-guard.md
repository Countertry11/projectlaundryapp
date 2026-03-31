# Admin User Delete Guard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mencegah admin menghapus akun admin dari menu pengguna, termasuk akun admin yang sedang login.

**Architecture:** Tambahkan helper guard yang kecil dan teruji untuk menentukan apakah target user dapat dihapus, lalu gunakan helper itu di halaman admin pengguna untuk menyembunyikan aksi hapus dan menolak penghapusan di handler. Pendekatan ini menjaga logika tetap terpusat tanpa mengubah alur data lain di halaman besar tersebut.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner.

---

## Chunk 1: Delete Guard Helper and Tests

### Task 1: Tambahkan helper guard penghapusan admin

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminUserDeleteGuard.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminUserDeleteGuard.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { canDeleteAdminManagedUser } from "./adminUserDeleteGuard.mjs";

test("blocks deleting another admin account", () => {
  assert.equal(
    canDeleteAdminManagedUser({
      currentUser: { id: "1", role: "admin" },
      targetUser: { id: "2", role: "admin" },
    }),
    false,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminUserDeleteGuard.test.mjs`
Expected: FAIL because helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function canDeleteAdminManagedUser({ currentUser, targetUser }) {
  if (!targetUser) return false;
  if (targetUser.role === "admin") return false;
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/adminUserDeleteGuard.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/adminUserDeleteGuard.mjs lib/adminUserDeleteGuard.test.mjs
git commit -m "test: add admin delete guard helper"
```

## Chunk 2: Admin User Page Guard

### Task 2: Terapkan guard pada halaman admin pengguna

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/pengguna/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminUserDeleteGuard.mjs`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/context/AuthContext.tsx`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminUserDeleteGuard.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test yang memastikan user non-admin tetap boleh dihapus:

```js
test("allows deleting non-admin users", () => {
  assert.equal(
    canDeleteAdminManagedUser({
      currentUser: { id: "1", role: "admin" },
      targetUser: { id: "3", role: "kasir" },
    }),
    true,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminUserDeleteGuard.test.mjs`
Expected: FAIL until the helper covers the full rule set.

- [ ] **Step 3: Write minimal implementation**

Gunakan `useAuth()` dan helper guard untuk:

```tsx
const { user: currentUser } = useAuth();

function canDeleteUser(targetUser: UserType) {
  return canDeleteAdminManagedUser({
    currentUser,
    targetUser,
  });
}
```

Lalu:
- hanya tampilkan tombol hapus jika `canDeleteUser(u)` bernilai `true`
- cegah `setDeleteConfirm` untuk target terlarang
- cegah `handleDelete` jika target user tidak boleh dihapus

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/adminUserDeleteGuard.test.mjs`
- `npx eslint app/admin/pengguna/page.tsx lib/adminUserDeleteGuard.mjs lib/adminUserDeleteGuard.test.mjs`

Expected:
- Tests PASS
- Lint PASS untuk file yang disentuh

- [ ] **Step 5: Commit**

```bash
git add app/admin/pengguna/page.tsx lib/adminUserDeleteGuard.mjs lib/adminUserDeleteGuard.test.mjs
git commit -m "feat: block admin account deletion"
```
