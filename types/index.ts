// User Types
export type UserRole = "admin" | "kasir" | "owner";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Outlet Types
export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  manager?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  join_date?: string;
  is_member: boolean;
  total_transactions: number;
  total_spent: number;
  created_at?: string;
  updated_at?: string;
}

// Product Types
export type ProductCategory =
  | "cuci_kering"
  | "cuci_setrika"
  | "dry_clean"
  | "express";

export interface Product {
  id: string;
  outlet_id?: string;
  name: string;
  category?: ProductCategory;
  price: number;
  unit: string;
  duration_hours: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Paket Types (legacy table tb_paket)
export type JenisPaket = "kiloan" | "selimut" | "bed_cover" | "kaos" | "lain";

export interface Paket {
  id: number;
  id_outlet?: number;
  jenis?: JenisPaket;
  nama_paket: string;
  harga: number;
  created_at?: string;
}

// Transaction Types
export type TransactionStatus =
  | "pending"
  | "processing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "transfer" | "debit_card" | "credit_card";

export interface Transaction {
  id: string;
  invoice_number: string;
  customer_id?: string;
  outlet_id?: string;
  kasir_id?: string;
  transaction_date?: string;
  due_date?: string;
  status: TransactionStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  discount: number;
  tax: number;
  grand_total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  customer?: Customer;
  outlet?: Outlet;
  kasir?: User;
  details?: TransactionDetail[];
}

export interface TransactionDetail {
  id: string;
  transaction_id?: string;
  product_id?: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  created_at?: string;
  // Joined data
  product?: Product;
}

export interface Payment {
  id: string;
  transaction_id?: string;
  amount: number;
  payment_method?: PaymentMethod;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

// Report Types
export interface LaporanHarian {
  tanggal: string;
  totalTransaksi: number;
  totalPendapatan: number;
  totalBelumDibayar: number;
}

export interface LaporanBulanan {
  bulan: string;
  totalTransaksi: number;
  totalPendapatan: number;
  rataRataPerHari: number;
}

export interface LaporanPaket {
  id_paket: number;
  nama_paket: string;
  jumlahTerjual: number;
  totalPendapatan: number;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface CustomerForm {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface OutletForm {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  manager?: string;
}

export interface PaketForm {
  nama_paket: string;
  harga: number;
  jenis: JenisPaket;
  id_outlet?: number;
}

export interface UserForm {
  username: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

export interface TransactionForm {
  customer_id: string;
  outlet_id?: string;
  items: {
    product_id?: string;
    paket_id?: number;
    quantity: number;
    price: number;
  }[];
  discount: number;
  tax: number;
  notes?: string;
}
