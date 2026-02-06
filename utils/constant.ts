// Application Constants

// App Info
export const APP_NAME = "Dukun Busa";
export const APP_DESCRIPTION = "Santet Noda, Pelet Wangi";
export const APP_VERSION = "1.0.0";

// API Routes
export const API_ROUTES = {
  AUTH: "/api/auth",
  OUTLET: "/api/outlet",
  PAKET: "/api/paket",
  TRANSAKSI: "/api/transaksi",
  USER: "/api/user",
  LAPORAN: "/api/laporan",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  KASIR: "kasir",
  OWNER: "owner",
} as const;

// Transaction Status
export const STATUS_TRANSAKSI = {
  BARU: "baru",
  PROSES: "proses",
  SELESAI: "selesai",
  DIAMBIL: "diambil",
} as const;

export const STATUS_TRANSAKSI_LABELS: Record<string, string> = {
  baru: "Baru",
  proses: "Proses",
  selesai: "Selesai",
  diambil: "Diambil",
};

export const STATUS_TRANSAKSI_COLORS: Record<string, string> = {
  baru: "bg-blue-100 text-blue-800",
  proses: "bg-yellow-100 text-yellow-800",
  selesai: "bg-green-100 text-green-800",
  diambil: "bg-gray-100 text-gray-800",
};

// Payment Status
export const STATUS_PEMBAYARAN = {
  DIBAYAR: "dibayar",
  BELUM_DIBAYAR: "belum_dibayar",
} as const;

export const STATUS_PEMBAYARAN_LABELS: Record<string, string> = {
  dibayar: "Dibayar",
  belum_dibayar: "Belum Dibayar",
};

export const STATUS_PEMBAYARAN_COLORS: Record<string, string> = {
  dibayar: "bg-green-100 text-green-800",
  belum_dibayar: "bg-red-100 text-red-800",
};

// Jenis Kelamin
export const JENIS_KELAMIN = {
  L: "Laki-laki",
  P: "Perempuan",
} as const;

// Jenis Paket
export const JENIS_PAKET = {
  kiloan: "Kiloan",
  selimut: "Selimut",
  bed_cover: "Bed Cover",
  kaos: "Kaos",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Date Format
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";

// Cookie Names
export const COOKIE_AUTH_TOKEN = "auth-token";
export const COOKIE_USER_DATA = "user-data";

// Local Storage Keys
export const LS_THEME = "theme";
export const LS_SIDEBAR_COLLAPSED = "sidebar-collapsed";