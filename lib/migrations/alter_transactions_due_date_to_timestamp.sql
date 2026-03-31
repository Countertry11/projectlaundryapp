-- ================================================================
-- MIGRATION: Preserve time component in transactions.due_date
-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor
-- ================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'due_date'
      AND data_type = 'date'
  ) THEN
    ALTER TABLE public.transactions
    ALTER COLUMN due_date TYPE timestamp without time zone
    USING (
      due_date::timestamp
      + COALESCE(transaction_date::time, TIME '00:00:00')
    );
  END IF;
END $$;

-- Catatan:
-- Jika data lama sebelumnya sudah terpotong menjadi tanggal saja,
-- jam aslinya memang tidak bisa dipulihkan 100%.
-- Migration ini memakai jam transaksi sebagai fallback terbaik.
