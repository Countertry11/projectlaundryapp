import { supabase } from "@/lib/supabase";
import { LaporanHarian, LaporanBulanan, LaporanPaket } from "@/types";

/**
 * Laporan Service - Handle all report-related data fetching
 */
export const laporanService = {
  /**
   * Get daily report data
   */
  async getHarian(filter?: { id_outlet?: string }): Promise<LaporanHarian[]> {
    try {
      let query = supabase
        .from("transactions")
        .select("transaction_date, grand_total, payment_status")
        .order("transaction_date", { ascending: false });

      if (filter?.id_outlet) {
        query = query.eq("outlet_id", filter.id_outlet);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching daily report:", error);
        return [];
      }

      // Group by date
      const grouped = (data || []).reduce(
        (acc, trx) => {
          const date = trx.transaction_date?.split("T")[0] || "Unknown";
          if (!acc[date]) {
            acc[date] = {
              tanggal: date,
              totalTransaksi: 0,
              totalPendapatan: 0,
              totalBelumDibayar: 0,
            };
          }
          acc[date].totalTransaksi += 1;
          acc[date].totalPendapatan += Number(trx.grand_total) || 0;
          if (trx.payment_status !== "paid") {
            acc[date].totalBelumDibayar += Number(trx.grand_total) || 0;
          }
          return acc;
        },
        {} as Record<string, LaporanHarian>,
      );

      return Object.values(grouped);
    } catch (error) {
      console.error("Error in getHarian:", error);
      return [];
    }
  },

  /**
   * Get monthly report data
   */
  async getBulanan(year: number, outletId?: string): Promise<LaporanBulanan[]> {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      let query = supabase
        .from("transactions")
        .select("transaction_date, grand_total")
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);

      if (outletId) {
        query = query.eq("outlet_id", outletId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching monthly report:", error);
        return [];
      }

      // Group by month
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const grouped = (data || []).reduce(
        (acc, trx) => {
          const date = new Date(trx.transaction_date);
          const monthIndex = date.getMonth();
          const monthName = monthNames[monthIndex];

          if (!acc[monthName]) {
            acc[monthName] = {
              bulan: monthName,
              totalTransaksi: 0,
              totalPendapatan: 0,
              rataRataPerHari: 0,
            };
          }
          acc[monthName].totalTransaksi += 1;
          acc[monthName].totalPendapatan += Number(trx.grand_total) || 0;
          return acc;
        },
        {} as Record<string, LaporanBulanan>,
      );

      // Calculate average per day (assuming 30 days per month)
      Object.values(grouped).forEach((month) => {
        month.rataRataPerHari = Math.round(month.totalPendapatan / 30);
      });

      return Object.values(grouped);
    } catch (error) {
      console.error("Error in getBulanan:", error);
      return [];
    }
  },

  /**
   * Get report by package/paket
   */
  async getPerPaket(outletId?: number): Promise<LaporanPaket[]> {
    try {
      // This would need transaction_details joined with tb_paket
      // For now, return empty - will implement when needed
      return [];
    } catch (error) {
      console.error("Error in getPerPaket:", error);
      return [];
    }
  },

  /**
   * Get summary statistics
   */
  async getSummary(outletId?: string): Promise<{
    totalPendapatan: number;
    totalTransaksi: number;
    pendingCount: number;
    completedCount: number;
  }> {
    try {
      let query = supabase
        .from("transactions")
        .select("grand_total, status, payment_status");

      if (outletId) {
        query = query.eq("outlet_id", outletId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching summary:", error);
        return {
          totalPendapatan: 0,
          totalTransaksi: 0,
          pendingCount: 0,
          completedCount: 0,
        };
      }

      const result = (data || []).reduce(
        (acc, trx) => {
          acc.totalTransaksi += 1;
          acc.totalPendapatan += Number(trx.grand_total) || 0;
          if (trx.status === "pending") acc.pendingCount += 1;
          if (trx.status === "completed") acc.completedCount += 1;
          return acc;
        },
        {
          totalPendapatan: 0,
          totalTransaksi: 0,
          pendingCount: 0,
          completedCount: 0,
        },
      );

      return result;
    } catch (error) {
      console.error("Error in getSummary:", error);
      return {
        totalPendapatan: 0,
        totalTransaksi: 0,
        pendingCount: 0,
        completedCount: 0,
      };
    }
  },
};

/**
 * Customer Service
 */
export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Transaction Service
 */
export const transactionService = {
  async getAll(filter?: { outlet_id?: string; status?: string }) {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        customer:customers(id, name, phone),
        kasir:users(id, full_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (filter?.outlet_id) {
      query = query.eq("outlet_id", filter.outlet_id);
    }
    if (filter?.status) {
      query = query.eq("status", filter.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(transaction: {
    customer_id: string;
    outlet_id?: string;
    kasir_id?: string;
    total_amount: number;
    discount?: number;
    tax?: number;
    grand_total: number;
    notes?: string;
  }) {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          ...transaction,
          invoice_number: invoiceNumber,
          status: "pending",
          payment_status: "unpaid",
          transaction_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("transactions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async updatePaymentStatus(id: string, payment_status: string) {
    const { error } = await supabase
      .from("transactions")
      .update({ payment_status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};
