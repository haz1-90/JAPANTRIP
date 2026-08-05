# SETUP — KNM Japan 2026 (langkah demi langkah)

Ikut atas ke bawah. Semua sekali ~15 minit. Lepas siap, app terus jalan penuh
(termasuk modul Duit). Kau hanya perlu buat ini **sekali**.

---

## BAHAGIAN A — Apps Script + auto-buat tab (7 minit)

Sheet **JAPAN NOV 2026** yang sedia ada (7 tab lama JANGAN usik). Tab baru
`Members` & `Expenses` akan dibuat **automatik** — tak payah taip header manual.

1. Dalam Sheet → menu **Extensions → Apps Script** (project sedia ada akan terbuka).
2. Buka fail `Code.gs` dalam repo GitHub → **copy SEMUA** isi dia:
   `https://github.com/haz1-90/JAPANTRIP` → fail `Code.gs`
3. Dalam Apps Script editor: **padam semua** kod lama → **paste** yang baru → 💾 Save.
4. **Auto-buat tab:** kat bar atas editor ada dropdown fungsi (biasanya tertulis
   `doGet`). Tukar ke **`setupTabs`** → tekan **▶ Run**.
   - Kali pertama Google akan minta kebenaran: **Review permissions** →
     pilih akaun kau → *Advanced* → *Go to ... (unsafe)* → **Allow**.
     (Ini skrip kau sendiri, jadi selamat.)
   - Siap → mesej keluar: `✅ Tab "Members" dibuat...` `✅ Tab "Expenses" dibuat...`
   - Balik ke Sheet — 2 tab baru dah ada dengan header lengkap & bold.
5. Dalam tab **Members**, isi nama 5 orang kat kolum A (baris 2–6).
   Guna nama panggilan pendek — nama ni yang keluar dalam app.
   Kolum `qr_link` & `note` biar kosong dulu (Bahagian D).
6. Kiri, tekan ⚙️ **Project Settings** → scroll ke **Script Properties**:
   - Pastikan `ADMIN_PIN` masih ada (PIN penuh kau — jangan kongsi).
   - Tekan **Add script property** → Name: `EXPENSE_PIN` → Value: PIN baru
     (contoh 6 digit, MESTI lain dari ADMIN_PIN) → Save.
   - PIN ni nanti kongsi dengan 4 orang lain ikut WhatsApp — dia hanya boleh
     **tambah belanja**, tak boleh ubah itinerary.
7. Deploy semula — **PENTING, ikut cara ini supaya URL tak berubah**:
   - **Deploy → Manage deployments**
   - Tekan ✏️ (Edit) kat deployment sedia ada
   - **Version: New version** → **Deploy**
   - Confirm setting: *Execute as: Me* · *Who has access: Anyone*
   - Tutup. **JANGAN** guna "New deployment" (tu buat URL baru — app akan putus).

---

## BAHAGIAN B — Test (3 minit)

1. Buka app: `https://haz1-90.github.io/JAPANTRIP/` → tekan **Refresh** (atas kanan).
2. Tab **Expenses** (bawah, tengah) → kad "Setup required" patut DAH HILANG,
   ganti dengan chips nama 5 orang.
3. Pilih nama kau kat "I am".
4. Tekan **Add expense** → isi test: `Test`, `100`, ¥ → Save →
   masukkan **EXPENSE_PIN** bila diminta → patut keluar "Expense saved".
5. Check Sheet tab Expenses — ada 1 baris baru. ✅ Berjaya!
6. Padam baris test tu terus dalam Sheet (klik kanan nombor baris → Delete row),
   pastu Refresh app.

**Kalau "PIN salah":** check Script Properties ejaan `EXPENSE_PIN` betul.
**Kalau "Sync failed" / setup card tak hilang:** check nama tab/header ejaan tepat,
dan deploy guna Manage deployments → Edit (bukan New deployment).

---

## BAHAGIAN C — QR & Resit (bila-bila, sebelum trip)

### QR DuitNow setiap member
1. Setiap orang buka app bank sendiri → DuitNow QR → screenshot.
2. Upload screenshot ke **Google Drive** → klik kanan file → **Share →
   Anyone with the link → Viewer** → Copy link.
3. Paste link tu dalam Sheet tab `Members`, kolum `qr_link`, baris nama sendiri.
4. Test: app → Expenses → "Member payment QR codes" → gambar patut keluar.

> Nota: QR DuitNow memang direka untuk dikongsi (ia untuk TERIMA duit).
> Tapi sesiapa yang ada URL app boleh nampak — kalau ada member tak selesa,
> biar kosong; settle guna no. akaun dalam `note`.

### Resit belanja (masa trip)
1. Snap gambar resit → upload ke Drive (atau guna link Google Photos).
2. Masa tambah belanja, paste link kat ruang **"Receipt (optional)"** —
   atau tambah kemudian dalam Sheet, kolum `receipt_link`.
3. Dalam senarai belanja, item yang ada resit akan tunjuk butang 🧾 — tekan untuk buka.

> Tip masa trip: buat satu folder Drive "Resit Japan" yang di-share pada semua,
> upload semua resit ke situ — senang cari balik.

---

## RUJUKAN PANTAS

| Benda | Di mana |
|---|---|
| Tukar itinerary/masa/tempat/budget | Edit Sheet terus, atau app (Admin PIN) |
| Tambah belanja | App → Expenses (EXPENSE_PIN — semua orang boleh) |
| Edit/padam belanja | Admin dalam app, atau edit Sheet terus |
| Tukar kadar ¥→RM | Sheet → Info → `Exchange rate` |
| Trip anjak tarikh | Sheet → Info → `Dates` (format "8-15 November 2026") |
| PIN | Script Properties: `ADMIN_PIN` (kau), `EXPENSE_PIN` (group) |
