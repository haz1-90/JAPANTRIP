/**
 * SEKALI GUNA — masukkan bahagian KLIA2 (Hari 1) ke tab Itinerary.
 *
 * CARA:
 *   1. Apps Script editor → butang + sebelah "Files" → Script → nama: onetime
 *   2. Padam isi fail baru tu → paste SEMUA fail ini → 💾 Save
 *   3. Dropdown fungsi atas → pilih  addKLIA2  → ▶ Run
 *   4. Tengok Execution log. Patut baca: "SIAP — 4 baris dimasukkan..."
 *   5. Buka app → Refresh. Padam fail `onetime.gs` tu. Habis.
 *
 * SELAMAT DIJALANKAN BERKALI-KALI:
 *   Kalau D1-00A dah wujud, dia berhenti dan tak masukkan apa-apa.
 *   Jadi kalau tertekan Run dua kali, tiada baris berganda.
 *
 * TIDAK MENYENTUH:
 *   Tiada baris sedia ada dipadam atau diubah. Tiada tab lain disentuh.
 *   Kalau nak buang semula: padam 4 baris D1-00A..D1-00D dalam Sheet.
 *
 * Masa ditulis dalam WAKTU MALAYSIA, format sama macam baris lain
 * ("11:50 AM"). App kenal ia waktu Malaysia melalui lokasi "KLIA2", jadi
 * tiada apa perlu ditaip lain daripada biasa. App sendiri yang papar
 * lencana MYT di sebelah jam, dan kira jurang KUL→Haneda sebagai 6j50m
 * (bukan 7j50m) supaya pacing tak tunjuk "Behind 1h" palsu di KLIA2.
 */
// Pembalut supaya ralat sebenar keluar dalam Execution log. Apps Script
// kadang-kadang hanya papar "Unknown error" pada bar atas — itu mesej IDE,
// bukan mesej skrip. Log di bawah ni yang beritahu punca sebenar.
function addKLIA2() {
  try {
    return addKLIA2_();
  } catch (err) {
    Logger.log('RALAT SEBENAR: ' + (err && err.message ? err.message : err));
    Logger.log('Jenis: ' + (err && err.name));
    if (err && err.stack) Logger.log('Stack: ' + err.stack);
    throw err;
  }
}

// Ujian cepat — Run fungsi ini kalau addKLIA2 gagal tanpa sebab jelas.
// Ia tak menulis apa-apa; cuma beritahu skrip ini nampak Sheet mana.
function testKLIA2() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('MASALAH: getActiveSpreadsheet() = null. Projek skrip ini TIDAK ' +
                 'terikat pada mana-mana Sheet (standalone). Buka Sheet → ' +
                 'Extensions → Apps Script, dan letak fail ini dalam projek itu.');
      return;
    }
    Logger.log('Sheet: ' + ss.getName());
    Logger.log('Tab ada: ' + ss.getSheets().map(function (s) { return s.getName(); }).join(', '));
    var sh = ss.getSheetByName('Itinerary');
    if (!sh) { Logger.log('MASALAH: tab "Itinerary" tak jumpa (semak ejaan/huruf besar).'); return; }
    var d = sh.getDataRange().getValues();
    Logger.log('Itinerary: ' + (d.length - 1) + ' baris data');
    Logger.log('Header: ' + d[0].join(' | '));
    var idCol = d[0].map(function (h) { return String(h).trim(); }).indexOf('id');
    Logger.log('Kolum "id" di posisi: ' + idCol + (idCol === -1 ? '  <-- MASALAH' : ''));
    for (var i = 1; i < d.length; i++) {
      if (String(d[i][idCol]).trim() === 'D1-01') { Logger.log('D1-01 di baris: ' + (i + 1)); break; }
    }
    Logger.log('OK — semua elok. Boleh Run addKLIA2.');
  } catch (err) {
    Logger.log('RALAT: ' + (err && err.message ? err.message : err));
  }
}

function addKLIA2_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Itinerary');
  if (!sh) { Logger.log('GAGAL: tab "Itinerary" tak jumpa.'); return; }

  var data = sh.getDataRange().getValues();
  if (!data.length) { Logger.log('GAGAL: tab Itinerary kosong.'); return; }
  var head = data[0].map(function (h) { return String(h).trim(); });

  var idCol = head.indexOf('id');
  if (idCol === -1) { Logger.log('GAGAL: kolum "id" tak jumpa dalam header.'); return; }

  // Baris baru — ditulis ikut NAMA kolum, bukan kedudukan. Kalau susunan
  // kolum dalam Sheet berubah suatu hari nanti, ini tetap masuk tempat betul.
  var ROWS = [
    {
      id: 'D1-00A', day: 1, date: '8 Nov', time: '11:50 AM',
      activity: 'Sampai KLIA2 — kumpul di Level 3, check-in',
      location: 'KLIA2', lat: 2.7456, lng: 101.6866,
      type: 'transport', urgent: 'YES', status: '',
      transit_info: 'AirAsia international check-in · Level 3 Departure Hall',
      notes: 'Sampai 3 jam awal. 5 pax — passport, boarding pass, timbang bagasi'
    },
    {
      id: 'D1-00B', day: 1, date: '8 Nov', time: '1:50 PM',
      activity: 'Bag drop TUTUP — kena dah check-in',
      location: 'KLIA2', lat: 2.7456, lng: 101.6866,
      type: 'transport', urgent: 'YES', status: '',
      transit_info: 'Kaunter tutup 60 minit sebelum berlepas',
      notes: 'Cut-off keras. Lepas ni bagasi tak boleh masuk'
    },
    {
      id: 'D1-00C', day: 1, date: '8 Nov', time: '2:00 PM',
      activity: 'Imigresen & security, terus ke gate',
      location: 'KLIA2', lat: 2.7456, lng: 101.6866,
      type: 'transport', urgent: '', status: '',
      transit_info: 'Nombor gate ada pada boarding pass — tengok skrin KLIA2',
      notes: 'Ada di gate sebelum 2:20 PM'
    },
    {
      id: 'D1-00D', day: 1, date: '8 Nov', time: '2:50 PM',
      activity: 'Berlepas KUL — D7 522 ke Haneda (6j 50m)',
      location: 'KLIA2', lat: 2.7456, lng: 101.6866,
      type: 'transport', urgent: 'YES', status: '',
      transit_info: 'Pintu gate tutup 2:30 PM (20 minit sebelum)',
      notes: 'Mendarat HND 10:40 PM waktu Jepun. Jepun 1 jam ke depan'
    }
  ];

  // Dah pernah dijalankan? Berhenti — jangan gandakan.
  var existing = {};
  for (var i = 1; i < data.length; i++) existing[String(data[i][idCol]).trim()] = i + 1;
  var already = ROWS.filter(function (r) { return existing[r.id]; });
  if (already.length) {
    Logger.log('TIADA APA DIBUAT — baris ini dah wujud: ' +
               already.map(function (r) { return r.id; }).join(', ') +
               '. Padam dulu dalam Sheet kalau nak masukkan semula.');
    return;
  }

  // Masuk TEPAT di atas D1-01 (ketibaan Haneda). Kalau D1-01 tak dijumpai,
  // letak di baris 2 — app baca ikut susunan baris, jadi kedudukan penting.
  var anchor = existing['D1-01'] || 2;

  sh.insertRowsBefore(anchor, ROWS.length);
  var out = ROWS.map(function (r) {
    return head.map(function (h) { return r.hasOwnProperty(h) ? r[h] : ''; });
  });
  // Paksa lajur `time` jadi teks biasa DAHULU. Kalau tidak, Sheets tukar
  // "11:50 AM" jadi nilai masa sebenar, dan app akan terima tarikh 1899
  // (getValues pulangkan objek Date) — jam pelik keluar pada telefon.
  var timeCol = head.indexOf('time');
  if (timeCol !== -1) sh.getRange(anchor, timeCol + 1, ROWS.length, 1).setNumberFormat('@');
  sh.getRange(anchor, 1, ROWS.length, head.length).setValues(out);
  SpreadsheetApp.flush();

  Logger.log('SIAP — ' + ROWS.length + ' baris dimasukkan di baris ' + anchor +
             ' (tepat sebelum ' + (existing['D1-01'] ? 'D1-01' : 'baris pertama') + ').');
  Logger.log('Buka app → Refresh. Lepas tu boleh padam fail onetime.gs ini.');
}

/**
 * Buang " MYT" dari lajur `time` 4 baris KLIA2, supaya format jam sama
 * dengan semua baris lain dalam Sheet ("11:50 AM", bukan "11:50 AM MYT").
 *
 * App tetap tahu ia waktu Malaysia — pengesanan ikut lokasi "KLIA2" — dan
 * app sendiri yang papar lencana MYT di sebelah jam.
 *
 * Run SEKALI kalau kau dah jalankan addKLIA2 versi lama. Selamat diulang.
 */
function tidyKLIA2Times() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Itinerary');
  if (!sh) { Logger.log('GAGAL: tab "Itinerary" tak jumpa.'); return; }
  var data = sh.getDataRange().getValues();
  var head = data[0].map(function (h) { return String(h).trim(); });
  var idCol = head.indexOf('id'), tCol = head.indexOf('time');
  if (idCol === -1 || tCol === -1) { Logger.log('GAGAL: kolum id/time tak jumpa.'); return; }

  var mine = { 'D1-00A': 1, 'D1-00B': 1, 'D1-00C': 1, 'D1-00D': 1 };
  var n = 0;
  for (var i = 1; i < data.length; i++) {
    if (!mine[String(data[i][idCol]).trim()]) continue;
    var v = String(data[i][tCol]);
    var clean = v.replace(/\s*\bMYT\b\s*$/i, '').trim();
    if (clean === v) continue;
    var cell = sh.getRange(i + 1, tCol + 1);
    cell.setNumberFormat('@');   // kekalkan sebagai teks, jangan jadi nilai masa
    cell.setValue(clean);
    Logger.log('  ' + data[i][idCol] + ': "' + v + '"  ->  "' + clean + '"');
    n++;
  }
  SpreadsheetApp.flush();
  Logger.log(n ? ('SIAP — ' + n + ' jam dikemas. Buka app → Refresh.')
                : 'Tiada apa nak dikemas (jam dah bersih).');
}

/**
 * Kalau menyesal — buang balik 4 baris tu. Padam ikut id, jadi selamat
 * walaupun susunan baris dah berubah.
 */
function removeKLIA2() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Itinerary');
  if (!sh) { Logger.log('GAGAL: tab "Itinerary" tak jumpa.'); return; }
  var data = sh.getDataRange().getValues();
  var idCol = data[0].map(function (h) { return String(h).trim(); }).indexOf('id');
  if (idCol === -1) { Logger.log('GAGAL: kolum "id" tak jumpa.'); return; }

  var kill = { 'D1-00A': 1, 'D1-00B': 1, 'D1-00C': 1, 'D1-00D': 1 };
  var n = 0;
  // Dari bawah ke atas — kalau dari atas, nombor baris anjak lepas setiap padam.
  for (var i = data.length - 1; i >= 1; i--) {
    if (kill[String(data[i][idCol]).trim()]) { sh.deleteRow(i + 1); n++; }
  }
  SpreadsheetApp.flush();
  Logger.log(n ? ('SIAP — ' + n + ' baris KLIA2 dipadam.') : 'Tiada baris KLIA2 dijumpai.');
}
