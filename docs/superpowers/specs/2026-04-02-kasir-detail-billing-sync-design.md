# Kasir Detail Billing Sync Design

**Goal:** Membuat modal detail transaksi kasir menampilkan ringkasan tagihan lengkap dan otomatis menyinkronkan status diskon keterlambatan saat waktu berjalan.

## Ringkasan

Saat ini modal detail transaksi hanya menampilkan `grand_total` tanpa breakdown `subtotal`, `diskon`, `pajak`, dan `biaya tambahan`. Selain itu, indikator diskon di modal detail tidak berubah otomatis ketika `due_date` baru saja terlewati karena modal tidak memiliki mekanisme rerender dan sinkronisasi diskon sendiri.

## Aturan

- Modal detail harus menampilkan:
  - subtotal
  - diskon keterlambatan
  - subtotal setelah diskon
  - pajak
  - biaya tambahan
  - total tagihan
- Status `Diskon Berlaku` dan `Diskon Telat 5%` harus berubah otomatis setelah `due_date` terlewati.
- Jika diskon berubah karena keterlambatan, `grand_total` transaksi di detail juga harus ikut berubah dan tetap konsisten dengan daftar transaksi.

## Implementasi

- Tambahkan helper finansial transaksi untuk:
  - menghitung breakdown tagihan dari field transaksi yang sudah tersimpan
  - menghitung ulang `grand_total` saat persentase diskon berubah sambil mempertahankan biaya tambahan terinferensi
- Gunakan helper itu pada:
  - sinkronisasi diskon batch saat fetch daftar transaksi
  - sinkronisasi diskon satu transaksi saat modal detail terbuka
  - tampilan ringkasan tagihan di modal detail
- Tambahkan timer ringan saat modal detail terbuka untuk:
  - memicu rerender status diskon
  - melakukan sinkronisasi ke state dan database bila diskon berubah setelah melewati `due_date`

## Risiko

- Sinkronisasi berkala tidak boleh memblokir aksi utama seperti update status atau pembayaran.
- Breakdown finansial harus tetap aman bila data lama tidak punya biaya tambahan eksplisit; karena itu helper perlu menginferensi biaya tambahan dari kombinasi `total_amount`, `discount`, `tax`, dan `grand_total`.
