# KNM Japan 2026 — Travel Companion App

Panduan lengkap: deploy, struktur, dan cara sambung kerja kod.
Simpan fail ni dalam repo (`README.md`).

---

## 1. APA BENDA NI

App mobile satu-fail (`index.html`) untuk group trip Japan 8–15 Nov 2026.
5 orang buka guna URL. Hazwan (admin) boleh edit; orang lain view je.

**Seni bina (3 lapis):**

```
Google Sheet  ⇄  Apps Script (.gs)  ⇄  index.html (GitHub Pages)
  (data)          (jambatan API)        (app di telefon)
```

- **Google Sheet** = sumber data sebenar (7 tab)
- **Apps Script** = API baca/tulis, tulis kena PIN
- **index.html** = app; baca terus, tulis bila admin masuk PIN

---

## 2. LINK PENTING

| Benda | Nilai |
|-------|-------|
| Sheet ID | `1nK452ZWZ7PbYIJxB7aATQVM1Fqh3mg9-9MsDXWo_dJU` |
| Nama Sheet | JAPAN NOV 2026 |
| Apps Script URL | `https://script.google.com/macros/s/AKfycbyMe6XMnw70-o168BL4IRPRWrZnKRjFIoyIA9Bpjn9cf29T6EKMiRGDVnhC9Z6xtoApXw/exec` |
| PIN | Simpan dalam **Script Properties** (key `ADMIN_PIN`) — BUKAN dalam kod |
| App URL (GitHub Pages) | *(isi lepas deploy)* |

> ⚠️ Kalau redeploy Apps Script dan URL berubah, kena update `API_URL` dalam `index.html` (baris atas `<script>`).

---

## 3. CARA DEPLOY KE GITHUB PAGES

### Langkah A — Buat repo
1. github.com → **New repository**
2. Nama: `knm-japan` (atau apa-apa)
3. **Public** (tukar Private bila dah beli Pro)
4. Create

### Langkah B — Upload app
1. Dalam repo → **Add file → Upload files**
2. Drag `index.html`
3. Commit

### Langkah C — Hidupkan Pages
1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder `/root` → **Save**
4. Tunggu ~1 minit. URL keluar atas:
   `https://<username>.github.io/knm-japan/`

### Langkah D — Test
Buka URL atas telefon. Patut:
- Nampak jadual trip (data dari Sheet)
- 5 tab bawah: Today / Trip / Park / Stay / More
- Tekan **Admin** → masuk PIN → boleh edit

### Langkah E — Bagi group
Share URL dalam WhatsApp. Suruh mereka **Add to Home Screen** (jadi macam app).

---

## 4. STRUKTUR KOD (index.html — satu fail)

~600 baris, 3 bahagian:

```
<style> ........... CSS (tema navy/green/red, layout mobile)
<body> ............ HTML: header, 5 <section> skrin, nav bawah
<script> (1) ...... CONFIG + util + load/cache + nav + admin + API
<script> (2) ...... render tiap skrin + borang edit admin
```

**Fungsi utama (48 total):**

| Fungsi | Kerja |
|--------|-------|
| `refresh()` | Baca data dari Apps Script, simpan cache |
| `renderToday/Trip/Park/Stay/More()` | Lukis tiap skrin |
| `toggleAdmin() / submitPin()` | Mode admin |
| `setStatus/updateRow/addRow/deleteRow()` | Tulis ke Sheet (kena PIN) |
| `openEditForm/saveForm()` | Borang edit/tambah |
| `esc()` | Escape output (elak XSS) |

**Cache:** guna `localStorage` key `knm_japan_cache_v1`. App buka → tunjuk cache dulu (laju) → refresh belakang tabir → update. Offline pun boleh tengok salinan terakhir.

---

## 5. STRUKTUR DATA (7 tab dalam Sheet)

Column ikut Sheet sebenar (KNM_Japan_2026_Master). App map ikut **nama header**, jadi susunan/kolum tambahan tak kisah — asalkan nama header sama.

| Tab | Column |
|-----|--------|
| **Itinerary** | id, day, date, time, activity, location, lat, lng, type, urgent, status, transit_info, notes |
| **Accommodation** | id, name, dates, address, checkin, checkout, price_rm, lat, lng, maps_link, notes |
| **Places** | name, category, address, lat, lng, maps_link, notes |
| **Parking** | checkpoint, day, pick, tier, price_rm, size_LWH_cm, noah_fit, maps_link, notes, recheck |
| **Reminders** | id, when, title, detail, lead_time, status |
| **Info** | category, key, value |
| **Budget** | category, item, yen, total_rm, per_pax_rm, remark |

**Nota column penting:**
- `type` (Itinerary): transport / hotel / sightsee / food / prayer → tentukan ikon
- `urgent`: YES → keluar dalam "Urgent today"
- `status`: kosong / done → checkoff
- `transit_info`: platform & arah (contoh "Yamanote Line · toward Ueno")
- `noah_fit` (Parking): "OK" default → badge hijau. Kalau nak badge amaran, tulis "TIGHT…" / "CONFIRM…" / "DOES NOT…". Sekarang semua "OK", jadi amaran clearance (cth Shinjuku Flags W180 vs Noah W173) ada dalam `notes`.
- **Places** tab tak dirender lagi dalam app (data rujukan sahaja).
- **Budget**: baris subtotal guna perkataan "subtotal", baris besar guna "GRAND TOTAL" (app kesan ikut perkataan tu).

---

## 6a. TOOLS BARU (skrin More)

- **Waktu solat (ikut lokasi)** — auto ikut koordinat stop semasa, fetch dari Aladhan API (Muslim World League), cache offline. Perlu internet kali pertama tiap lokasi/hari.
- **Tukaran ¥ ⇄ RM** — converter built-in dua hala. Kadar diambil dari Info (`Exchange rate`) — edit situ untuk ubah.
- **Check halal & masjid** — link Halal Gourmet Japan, Halal Navi, + Maps (restoran halal / masjid berdekatan).
- **Kecemasan** — Polis 110, Ambulans 119, Kedutaan Malaysia (tel + peta), Hospital berdekatan. Boleh **tambah/edit/buang** kontak (embassy/takaful/hospital) — Admin je. Kontak tambahan disimpan dalam tab **Info** (category `Emergency`).

### Mode pengangkutan (drive / train / taxi)
Butang "Direction" bukak Google Maps ikut mod:
- **train** → mod transit, **drive/taxi** → mod driving, **walk** → walking.
- Default ikut kawasan: Kawaguchiko/Fuji = drive, Kyoto = taxi, Osaka = train, Tokyo & lain = train.
- Nak override satu-satu stop: tambah kolum **`transport`** dalam tab Itinerary, isi `drive`/`train`/`taxi`/`walk`. Edit terus dalam app (borang edit stop auto tunjuk field baru).
- Stop mod **drive** dapat butang tambahan **"Parking berdekatan"**.

---

## 6. CARA UPDATE DATA (2 jalan)

**Jalan 1 — dalam app (senang):**
Admin → masuk PIN → tekan edit/tambah/delete terus atas telefon.

**Jalan 2 — dalam Sheet (banyak sekaligus):**
Buka Google Sheet, edit macam biasa. App auto-ambil bila refresh.

Dua-dua sync sebab sumber sama (Sheet).

**App ni 100% data-driven** — semua benda ikut Sheet, termasuk:
- Kiraan "X stays" (auto kira dari tab Accommodation)
- Nota status Parking (Info: key mengandungi "parking" → keluar sebelah tajuk Park; buang row = hilang)
- Tarikh trip untuk logik pacing (Info: key `Dates`, format "8-15 November 2026" — kalau trip anjak, edit sini sahaja)
- Kadar tukaran ¥→RM (Info: key `Exchange rate`)

Kod hanya perlu diubah bila nak tambah *feature*, bukan bila trip berubah.

---

## 6b. LIVE PACING (skrin Today)

Semua pacing **admin sahaja** — orang lain nampak jadual biasa je. Aktif time trip (8–15 Nov 2026, atau bila ada stop dah "done"); sebelum tu senyap.

- **Badge pace** (Today) — banding masa sekarang (JST) lawan masa jadual stop seterusnya → "On schedule" / "Ahead …" / "Behind …".
- **Fixed point** = baris `urgent = YES` yang ada masa (train, solat Jumaat, flight). Ni masa yang TAK boleh gerak.
- **Toggle (Today):**
  - **Follow schedule** — tunjuk masa jadual asal tiap stop.
  - **Take your time** — baki masa sampai fixed point seterusnya dibahagi rata antara stop fleksibel. Duduk lama → stop lepas auto pendek; gerak awal → stop lepas jadi panjang. Fixed point tak berubah; kalau tak cukup masa, ia jadi merah.
- **Skrin Trip** — bila mode "Take your time" & tengah tengok hari semasa, tiap stop fleksibel dapat tag masa cadangan (≈HH:MM) atas timeline; fixed point ditag "fixed".
- Ni **advisory sahaja** — tak tulis ke Sheet. Butang "Mark done" pun admin je.

---

## 7. KALAU NAK UBAH KOD

**Tukar API URL** (bila redeploy Apps Script):
```js
const API_URL = "...url baru...";   // baris ~1 dalam <script> pertama
```

**Tukar warna tema:**
```css
:root{ --navy:#0C447C; --green:#0F6E56; --red:#A32D2D; ... }
```

**Tambah skrin baru:** tambah `<section class="screen" id="s-xxx">`, tambah butang nav, tambah fungsi `renderXxx()`, panggil dalam `renderAll()`.

**Selepas edit:** upload semula `index.html` ke GitHub (Add file → Upload → commit). Pages auto-update ~1 min.

---

## 8. SECURITY (ship-safe)

- ✅ PIN dalam Script Properties, **bukan** dalam kod
- ✅ Tulis mesti lalu PIN check di server (Apps Script)
- ✅ Output di-escape (`esc()`) — elak XSS
- ✅ HTTPS dua-dua hujung
- ✅ Data trip je — takde password/kad kredit
- ⚠️ Repo public = orang boleh **view** (tak boleh edit). Tukar private bila Pro.

**Bila dah beli GitHub Pro:**
Settings → Danger Zone → Change visibility → Private.
App tetap jalan; URL jadi tersembunyi.

---

## 9. TODO LEPAS DEPLOY

- [ ] Deploy, dapat URL, test atas telefon
- [ ] Confirm transit_info & platform yang bertag "confirm on-site"
- [ ] Verify timing Fuji Excursion Nov 2026 (itinerary tulis 5:40pm, jadual rasmi 3:03/4:51/5:36)
- [ ] Verify Hikari Kyoto→Mishima Nov 2026 (12:30pm)
- [ ] Recheck parking size vs Noah (L469.5·W173·H189.5) — booking mid-Oct
- [ ] Tukar repo private (bila Pro)

---

*KNM Japan Trip · App companion · Build Jul 2026*
