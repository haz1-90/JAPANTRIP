# Tambah permulaan trip: KLIA2 (Hari 1, 8 Nov)

Sheet sekarang bermula terus di **Haneda 10:40 PM**. Empat baris di bawah
menambah bahagian KLIA2 di depannya, supaya hari kejadian app terus tunjuk
"YOU ARE HERE NOW — KLIA2" dari pagi lagi.

Semua masa di bawah dikira dari penerbangan sedia ada dalam tab `Info`:
**D7 522 · KUL 14:50 → HND 22:40 · 8 Nov**

---

## Cara paling malas — biar skrip buat (1 minit)

Guna fail **`ONE_TIME_KLIA2.gs`** dalam repo ini:

1. Apps Script editor → tekan **+** sebelah "Files" → **Script** → nama `onetime`
2. Padam isi fail baru tu → paste semua isi `ONE_TIME_KLIA2.gs` → 💾 Save
3. Dropdown fungsi atas → pilih **`addKLIA2`** → **▶ Run**
4. Execution log patut baca: `SIAP — 4 baris dimasukkan di baris 2...`
5. Buka app → **Refresh** → padam fail `onetime.gs`. Habis.

Selamat ditekan Run dua kali — kalau baris dah wujud dia berhenti sendiri,
tiada baris berganda. Menyesal? Run **`removeKLIA2`**, Sheet balik macam asal.

Tak perlu deploy semula. Fail ni tak sentuh `Code.gs` langsung.

---

## Cara manual (kalau tak nak guna skrip)

1. Buka Sheet → tab **Itinerary**.
2. Cari baris `D1-01` (Arrival Haneda). Klik kanan nombor barisnya →
   **Insert 4 rows above**.
3. Klik sel **A** pada baris kosong pertama.
4. Salin blok bawah ini **sepenuhnya** → paste. Google Sheets akan pecahkan
   sendiri ikut kolum.
5. Buka app → **Refresh**. Siap.

> Urutan dalam app ikut **susunan baris dalam Sheet**, bukan nombor `id`.
> Jadi baris ini mesti berada di ATAS `D1-01`.

---

## Blok untuk di-paste

```
D1-00A	1	8 Nov	11:50 AM MYT	Sampai KLIA2 — kumpul di Level 3, check-in	KLIA2	2.7456	101.6866	transport	YES		AirAsia international check-in · Level 3 Departure Hall	Sampai 3 jam awal. 5 pax — passport, boarding pass, timbang bagasi
D1-00B	1	8 Nov	1:50 PM MYT	Bag drop TUTUP — kena dah check-in	KLIA2	2.7456	101.6866	transport	YES		Kaunter tutup 60 minit sebelum berlepas	Cut-off keras. Lepas ni bagasi tak boleh masuk
D1-00C	1	8 Nov	2:00 PM MYT	Imigresen & security, terus ke gate	KLIA2	2.7456	101.6866	transport			Nombor gate ada pada boarding pass — tengok skrin KLIA2	Ada di gate sebelum 2:20 PM
D1-00D	1	8 Nov	2:50 PM MYT	Berlepas KUL — D7 522 ke Haneda (6j 50m)	KLIA2	2.7456	101.6866	transport	YES		Pintu gate tutup 2:30 PM (20 minit sebelum)	Mendarat HND 10:40 PM waktu Jepun. Jepun 1 jam ke depan
```

Susunan kolum yang dijangka (sama dengan header sedia ada):

`id · day · date · time · activity · location · lat · lng · type · urgent · status · transit_info · notes`

---

## Kenapa ada "MYT" pada masa

Hari 1 bermula di Malaysia dan berakhir di Jepun. Kalau app baca dua-dua
sebagai nombor mentah, jurang KUL 2:50 PM → HND 10:40 PM jadi **7j 50m**
sedangkan penerbangan sebenarnya **6j 50m** — dan pacing akan tunjuk
"Behind 1h" sepanjang pagi di KLIA2 walaupun semuanya ikut jadual.

App sekarang kenal baris Malaysia (`MYT` dalam masa, atau `KLIA`/`Kuala Lumpur`
dalam lokasi) dan tukar ke waktu Jepun untuk kiraan dalaman. **Teks yang
dipapar kekal seperti yang ditaip dalam Sheet** — di KLIA2 orang nampak waktu
Malaysia, macam yang sepatutnya.

Jadi jangan buang perkataan `MYT` tu.

Baris `D8-03` (Arrive Kuala Lumpur, 15 Nov) pun dikenali secara automatik
melalui nama lokasi — tak perlu diubah.

---

## Tab Info — tak perlu ubah apa-apa

Bahagian **KLIA2** dalam skrin Flights (More → Flights) dikira terus daripada
baris `Info` yang sedia ada:

| category | key | value |
|---|---|---|
| Flight | Outbound | D7 522 · KUL 14:50 -> HND 22:40 (6h50m) · 8 Nov |

Kalau masa penerbangan berubah, **edit baris tu sahaja** — "be there",
"bag drop closes", "gate closes" semua ikut sendiri. Tiada masa ditulis mati
dalam kod.

Nak tambah butiran lain (tempat duduk, bagasi, no. tempahan): app → More →
**Flights** → *Add flight detail* (Admin), atau tambah baris `Flight` dalam
tab `Info` terus.

> ⚠️ Jangan simpan booking reference penuh di sini — sesiapa yang ada link app
> boleh baca, dan PNR + nama keluarga selalunya cukup untuk ubah tempahan.
