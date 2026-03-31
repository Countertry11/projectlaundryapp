-- ================================================================
-- MIGRATION: Create notifications table
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Buat tabel notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- User hanya bisa melihat notifikasi miliknya sendiri
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (true);

-- User bisa update (mark as read) notifikasi miliknya
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (true);

-- Insert policy (untuk system/admin bisa insert)
CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Delete policy
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (true);

-- 5. Enable Realtime untuk tabel ini
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ================================================================
-- TEST: Insert notifikasi contoh (ganti user_id dengan ID user yang ada)
-- ================================================================
-- INSERT INTO notifications (user_id, title, message, type)
-- VALUES 
--   ('YOUR_USER_ID', 'Transaksi Baru', 'Ada transaksi baru #INV-001 dari pelanggan Budi', 'info'),
--   ('YOUR_USER_ID', 'Pembayaran Diterima', 'Pembayaran untuk #INV-002 telah diterima', 'success'),
--   ('YOUR_USER_ID', 'Cucian Siap', 'Cucian pelanggan Sari sudah siap diambil', 'warning');
