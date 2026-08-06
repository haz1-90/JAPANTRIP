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
   - **EXPENSE_PIN adalah PILIHAN:**
     - **Tak set** (atau padam) = sesiapa yang ada link app boleh terus tambah
       belanja & muat naik resit, TANPA PIN. Paling senang untuk group.
       Mereka tetap TAK boleh edit/padam apa-apa atau sentuh tab lain.
     - **Set** = kena masuk PIN sekali sahaja setiap telefon, lepas tu app ingat.
     Nak tukar bila-bila: tambah atau padam property ni, deploy semula.
       (Tak perlu ubah kod — app tanya server sendiri.)
7. **Benarkan akses Drive** (WAJIB — kalau skip, scan resit akan gagal):
   - ⚙️ **Project Settings** → tanda ✅ **"Show appsscript.json manifest file in editor"**
   - Balik ke **Editor** → buka fail **`appsscript.json`** yang baru muncul
   - Padam semua isi → paste kandungan fail `appsscript.json` dari repo GitHub → 💾 Save
   - Dropdown fungsi → pilih **`authorize`** → **▶ Run**
   - Skrin kebenaran keluar, kali ni sebut **Google Drive** → *Advanced* →
     *Go to ... (unsafe)* → **Allow**
   - Execution log patut baca: `Folder resit: ... | Drive API: HTTP 200`

   > Kenapa perlu: web app TIDAK boleh papar skrin kebenaran sendiri. Kalau
   > skop Drive tak diberi awal-awal, scan resit gagal dengan mesej
   > "You do not have permission to call DriveApp".

8. Deploy semula — **PENTING, ikut cara ini supaya URL tak berubah**:
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

### Resit belanja (masa trip) — snap & auto-isi
1. Masa tambah belanja, tekan **Camera** (kamera terus buka) atau **Gallery**.
2. Lepas snap, app **terus baca resit** dan auto-isi **jumlah** + **nama kedai**.
   Semak & betulkan kalau silap — semua field masih boleh edit.
   Tekan **rescan** kalau nak cuba baca semula.
3. Gambar auto-dikecilkan (maks 1600px) supaya laju walaupun wifi hotel perlahan.
4. Tekan **Save** — gambar dimuat naik dulu, lepas tu baris belanja ditulis.
   Satu prompt PIN sahaja untuk kedua-duanya.
5. Dalam senarai belanja, item yang ada resit tunjuk butang 🧾 — tekan untuk buka.

Gambar disimpan dalam Google Drive **kau** sendiri, dalam folder yang dibuat
automatik: **"KNM Japan 2026 — Resit"**. Fail di-set *anyone with the link can
view* supaya boleh dibuka dari app.

> Masih boleh paste link manual dalam ruang bawah butang tu kalau gambar dah
> ada kat Drive/Photos.

**Cara OCR berfungsi:** gambar dihantar ke Apps Script, Drive tukar jadi Google Doc
(OCR terbina dalam, sokong Jepun), teks dibaca, doc sementara terus dibuang. Tiada
API berbayar, tiada perkhidmatan pihak ketiga. Parser cari label 合計 / 税込 / TOTAL —
sengaja abaikan 小計 (subtotal), お預り (tunai diberi) dan おつり (baki).

---

## PIN PENGENALAN (setiap orang)

Kolum `pin` dalam tab **Members**. **Pilihan** — kalau kosong, app tak tanya
apa-apa untuk orang itu.

- **Set kali pertama:** dalam app → More → *Team & my details* → **Set a PIN**.
  Tak perlu apa-apa kebenaran; sesiapa yang guna nama itu boleh set kali pertama.
- **Tukar:** butang yang sama, kena tahu PIN semasa.
- **Buang:** tukar PIN, biarkan medan baru kosong.
- **LUPA PIN:** kau (admin) kosongkan sel `pin` orang itu dalam Sheet.
  Lepas tu dia boleh set semula sendiri dalam app.
- **TUKAR ORANG / keluar:** tekan butang **🔒 Lock** sebelah sapaan "Hi ..."
  kat skrin Today. Terus balik ke skrin PIN — tak payah incognito atau clear
  browser data. Berguna masa nak test PIN orang lain.
- **Tiada timeout untuk PIN pengenalan** — sekali masuk, kekal masuk. Sengaja:
  app ni untuk orang berusia, tak elok paksa taip PIN tiap kali buka.
  **Mod admin pula mati sendiri lepas 30 minit** tak disentuh, supaya telefon
  yang tertinggal atas meja tak boleh dipakai untuk edit/padam.

PIN ini **tidak pernah dihantar ke telefon** — server hanya beritahu app
"ada PIN" atau "tiada". Jadi tiada siapa boleh baca PIN orang lain.

Ia untuk **pengenalan**, bukan kunci — supaya tiada siapa tersilap pilih nama
orang lain, dan setiap orang hanya boleh ubah baris Roster sendiri.

---

## RUJUKAN PANTAS

| Benda | Di mana |
|---|---|
| Tukar itinerary/masa/tempat/budget | Edit Sheet terus, atau app (Admin PIN) |
| Tambah belanja | App → Expenses (tiada PIN kalau EXPENSE_PIN tak di-set) |
| Edit/padam belanja | Admin dalam app, atau edit Sheet terus |
| Kadar ¥→RM | Auto (mid-market, refresh 6 jam). Sandaran: Sheet → Info → `Exchange rate` bila offline |
| Trip anjak tarikh | Sheet → Info → `Dates` (format "8-15 November 2026") |
| PIN | `ADMIN_PIN` (kau) & `EXPENSE_PIN` (pilihan) dalam Script Properties · PIN pengenalan dalam tab Members |
| Reset PIN orang | Kosongkan sel `pin` dalam tab Members — dia set semula sendiri |
