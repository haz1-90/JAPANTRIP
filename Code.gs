// ===== KNM JAPAN 2026 — Apps Script Backend =====
// Password TAK hardcode. Disimpan dalam Script Properties:
//   ADMIN_PIN   = PIN penuh (Hazwan) — semua action
//   EXPENSE_PIN = PIN kongsi group (optional) — HANYA boleh tambah row
//                 dalam tab Expenses. Tak boleh edit/delete/usik tab lain.
// Set: Project Settings > Script Properties > Add.
//
// DEPLOY: Deploy > Manage deployments > Edit > Version: New version
//   - Execute as: Me
//   - Who has access: Anyone   (WAJIB — supaya app boleh fetch tanpa login)
// Guna "Manage deployments > Edit" supaya URL TIDAK berubah.

const SS = SpreadsheetApp.getActiveSpreadsheet();
const TABS = ['Itinerary','Accommodation','Places','Parking','Reminders','Info','Budget','Members','Expenses'];

// ---- SETUP SEKALI: buat tab Members & Expenses dengan header betul ----
// Cara guna: pilih fungsi `setupTabs` kat atas editor > tekan Run.
// Selamat diulang — kalau tab dah ada, dia takkan padam apa-apa.
// NOTA: JANGAN guna SpreadsheetApp.getUi() di sini. Bila Run dari editor,
// dialog UI menunggu klik dalam tab Spreadsheet — kalau tak diklik, skrip
// tergantung sampai timeout 6 minit dan perubahan tak sempat disimpan.
// Guna Logger.log sahaja; hasil dibaca di Execution log.
function setupTabs() {
  var plan = {
    'Members':  ['name','qr_link','note'],
    'Expenses': ['id','date','day','title','category','amount','currency','rate_to_rm',
                 'amount_rm','paid_by','split_type','split_with','notes','receipt_link']
  };
  var msg = [];
  Object.keys(plan).forEach(function(name){
    var head = plan[name];
    var sh = SS.getSheetByName(name);
    if (!sh) {
      sh = SS.insertSheet(name);
      sh.getRange(1,1,1,head.length).setValues([head]);
      sh.getRange(1,1,1,head.length).setFontWeight('bold');
      sh.setFrozenRows(1);
      msg.push('✅ Tab "'+name+'" dibuat + header siap');
    } else {
      var cur = sh.getLastColumn() ? sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0] : [];
      var miss = head.filter(function(h){ return cur.indexOf(h) === -1; });
      if (cur.join('') === '') {
        sh.getRange(1,1,1,head.length).setValues([head]);
        sh.getRange(1,1,1,head.length).setFontWeight('bold');
        sh.setFrozenRows(1);
        msg.push('✅ Tab "'+name+'" dah ada (kosong) — header diisi');
      } else if (miss.length) {
        // tambah kolum yang kurang di hujung, data sedia ada tak diusik
        sh.getRange(1, cur.length+1, 1, miss.length).setValues([miss]);
        msg.push('✅ Tab "'+name+'" — tambah kolum: '+miss.join(', '));
      } else {
        msg.push('👍 Tab "'+name+'" dah betul, tiada perubahan');
      }
    }
  });
  SpreadsheetApp.flush();          // pastikan perubahan betul-betul ditulis
  var out = msg.join('\n');
  Logger.log(out);
  return out;
}

// ---- READ: bebas, tiada password (view mode) ----
function doGet(e) {
  try {
    const out = {};
    TABS.forEach(function(name){
      const sh = SS.getSheetByName(name);
      if (!sh) { out[name] = []; return; }
      const values = sh.getDataRange().getValues();
      out[name] = values;
    });
    return json({ ok:true, data: out });
  } catch (err) {
    return json({ ok:false, error: String(err) });
  }
}

// ---- WRITE: kena password (admin mode) ----
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    // 1) Cek password lawan Script Properties (bukan hardcode)
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('ADMIN_PIN');
    if (!stored) return json({ ok:false, error:'ADMIN_PIN belum di-set dalam Script Properties' });
    const expPin = props.getProperty('EXPENSE_PIN');
    const isAdmin = String(body.pin) === String(stored);
    const isExpense = !isAdmin && expPin && String(body.pin) === String(expPin);
    if (!isAdmin && !isExpense) return json({ ok:false, error:'PIN salah' });

    const action = body.action;
    const tab = body.tab;
    // EXPENSE_PIN scope: tambah belanja + muat naik resit SAHAJA.
    // Bukan edit, bukan delete, bukan tab lain.
    const okForExpensePin = (action === 'add' && tab === 'Expenses') || action === 'uploadReceipt';
    if (isExpense && !okForExpensePin) {
      return json({ ok:false, error:'PIN ni untuk tambah belanja sahaja' });
    }

    // ---- Muat naik gambar resit ke Drive (tiada tab terlibat) ----
    if (action === 'uploadReceipt') {
      if (!body.dataUrl) return json({ ok:false, error:'Tiada gambar' });
      const m = String(body.dataUrl).match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
      if (!m) return json({ ok:false, error:'Format gambar tak sah' });
      const bytes = Utilities.base64Decode(m[2]);
      if (bytes.length > 10 * 1024 * 1024) return json({ ok:false, error:'Gambar terlalu besar (max 10MB)' });
      const safe = String(body.name || 'receipt').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 60);
      const blob = Utilities.newBlob(bytes, m[1], safe + '.jpg');
      const file = receiptFolder_().createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      log_('uploadReceipt', 'Drive', file.getId());
      return json({ ok:true, url: 'https://drive.google.com/file/d/' + file.getId() + '/view', id: file.getId() });
    }

    // ---- Baca resit (OCR) — guna penukaran Drive, tiada API berbayar ----
    if (action === 'ocrReceipt') {
      if (!body.dataUrl) return json({ ok:false, error:'Tiada gambar' });
      const om = String(body.dataUrl).match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i);
      if (!om) return json({ ok:false, error:'Format gambar tak sah' });
      const obytes = Utilities.base64Decode(om[2]);
      if (obytes.length > 10 * 1024 * 1024) return json({ ok:false, error:'Gambar terlalu besar' });
      const text = ocrText_(Utilities.newBlob(obytes, om[1], 'scan.jpg'), body.lang || 'ja');
      if (text === null) return json({ ok:false, error:'OCR gagal — cuba gambar lebih jelas' });
      return json({ ok:true, text: text, parsed: parseReceipt_(text) });
    }

    if (TABS.indexOf(tab) === -1) return json({ ok:false, error:'Tab tak sah' });
    const sh = SS.getSheetByName(tab);
    if (!sh) return json({ ok:false, error:'Tab tak jumpa' });

    // 2) Validasi input asas
    if (action === 'update') {
      // update satu sel/baris: body.row (1-based, ikut sheet), body.values (array)
      if (!body.row || !Array.isArray(body.values)) return json({ ok:false, error:'Data update tak lengkap' });
      if (Number(body.row) < 2) return json({ ok:false, error:'Row 1 = header, tak boleh update' });
      sh.getRange(body.row, 1, 1, body.values.length).setValues([body.values]);
      log_('update', tab, body.row);
      return json({ ok:true });
    }
    if (action === 'add') {
      if (!Array.isArray(body.values)) return json({ ok:false, error:'Data add tak lengkap' });
      sh.appendRow(body.values);
      log_('add', tab, sh.getLastRow());
      return json({ ok:true, row: sh.getLastRow() });
    }
    if (action === 'delete') {
      if (!body.row) return json({ ok:false, error:'Row delete tak dinyatakan' });
      if (Number(body.row) < 2) return json({ ok:false, error:'Row 1 = header, tak boleh delete' });
      sh.deleteRow(body.row);
      log_('delete', tab, body.row);
      return json({ ok:true });
    }
    if (action === 'setStatus') {
      // checkoff cepat: cari baris ikut id (col A), set status
      if (!body.id) return json({ ok:false, error:'id tak dinyatakan' });
      const data = sh.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('id');
      const stCol = headers.indexOf('status');
      if (idCol === -1 || stCol === -1) return json({ ok:false, error:'Tiada kolum id/status' });
      for (var i=1;i<data.length;i++){
        if (String(data[i][idCol]) === String(body.id)) {
          sh.getRange(i+1, stCol+1).setValue(body.status || '');
          log_('setStatus', tab, i+1);
          return json({ ok:true });
        }
      }
      return json({ ok:false, error:'id tak jumpa' });
    }
    return json({ ok:false, error:'Action tak dikenali' });
  } catch (err) {
    return json({ ok:false, error: String(err) });
  }
}

// ---- OCR: upload gambar sebagai Google Doc (Drive buat OCR), baca teks, buang ----
// Guna Drive REST v3 dengan token skrip sendiri — tak perlu enable Advanced Service.
function ocrText_(blob, lang) {
  try {
    const token = ScriptApp.getOAuthToken();
    const boundary = 'knmocr' + Date.now();
    const meta = { name: 'ocr-temp-' + Date.now(), mimeType: 'application/vnd.google-apps.document' };
    let bytes = Utilities.newBlob(
      '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(meta) + '\r\n' +
      '--' + boundary + '\r\nContent-Type: ' + blob.getContentType() + '\r\n\r\n'
    ).getBytes();
    bytes = bytes.concat(blob.getBytes()).concat(Utilities.newBlob('\r\n--' + boundary + '--').getBytes());

    // Biar Drive kesan bahasa sendiri. Kalau dipaksa 'ja', teks rumi (English/BM)
    // jadi teruk; auto-detect boleh baca Jepun DAN rumi.
    const langQ = (lang && lang !== 'auto') ? ('&ocrLanguage=' + encodeURIComponent(lang)) : '';
    const up = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart' + langQ,
      { method: 'post',
        contentType: 'multipart/related; boundary=' + boundary,
        payload: bytes,
        headers: { Authorization: 'Bearer ' + token },
        muteHttpExceptions: true });
    if (up.getResponseCode() >= 300) { log_('ocrFail', 'upload', up.getResponseCode()); return null; }
    const id = JSON.parse(up.getContentText()).id;
    if (!id) return null;

    const ex = UrlFetchApp.fetch(
      'https://www.googleapis.com/drive/v3/files/' + id + '/export?mimeType=text/plain',
      { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
    const txt = ex.getResponseCode() < 300 ? ex.getContentText() : null;
    try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {}
    return txt;
  } catch (err) {
    log_('ocrFail', String(err).slice(0, 80), '');
    return null;
  }
}

// ---- Cuba teka jumlah / kedai / tarikh dari teks resit ----
function parseReceipt_(text) {
  const lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(String);
  const out = { total: null, currency: null, title: null, date: null };

  function num(s) {
    const n = parseFloat(String(s).replace(/[, ]/g, ''));
    return isFinite(n) ? n : null;
  }
  // Label "jumlah" dalam BJ / BM / BI. 小計/subtotal sengaja TIDAK diambil.
  const TOTAL = /(合\s*計|お?会計|税込\s*合?計|総額|お買上げ?計|grand\s*total|nett?\s*total|total\s*(amount|due|payable)?|amount\s*(due|payable)|balance\s*due|jumlah|bayar)/i;
  const SUB   = /(小\s*計|subtotal|sub\s*total|お預り|おつり|釣銭|change|tunai|cash|tendered|rounding|discount|tax|消費税|税)/i;

  let best = null;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (SUB.test(L)) continue;
    if (!TOTAL.test(L)) continue;
    // nombor pada baris sama, kalau tiada cuba baris berikut
    let m = L.match(/(?:¥|￥|RM|MYR|\$|USD)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g);
    let cand = null;
    if (m && m.length) cand = num(m[m.length - 1].replace(/[^\d.,]/g, ''));
    if (cand == null && lines[i + 1]) {
      const m2 = lines[i + 1].match(/([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);
      if (m2) cand = num(m2[1]);
    }
    if (cand != null && cand > 0) { best = cand; if (/¥|￥|円/.test(L)) out.currency = 'JPY';
                                    if (/RM|MYR/i.test(L)) out.currency = 'MYR'; }
  }
  // Tiada label jumpa → ambil nombor harga terbesar sebagai anggaran.
  // Terima simbol mata wang (¥ RM $) ATAU nombor berdesimal 2 angka (12.50),
  // supaya resit English/tanpa simbol pun boleh dibaca.
  if (best == null) {
    let mx = 0;
    lines.forEach(function (L) {
      if (SUB.test(L)) return;
      const sym = L.match(/(?:¥|￥|RM|MYR|\$)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g) || [];
      sym.forEach(function (a) { const v = num(a.replace(/[^\d.,]/g, '')); if (v && v > mx) mx = v; });
      if (!sym.length) {
        const dec = L.match(/\b[0-9][0-9,]*\.[0-9]{2}\b/g) || [];
        dec.forEach(function (a) { const v = num(a); if (v && v > mx) mx = v; });
      }
    });
    if (mx > 0) best = mx;
  }
  out.total = best;
  if (!out.currency && /¥|￥|円/.test(text)) out.currency = 'JPY';
  if (!out.currency && /\bRM\b|MYR/i.test(text)) out.currency = 'MYR';

  // Nama kedai: baris awal yang bermakna (bukan nombor/tarikh/alamat)
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const L = lines[i];
    if (L.length < 2 || L.length > 40) continue;
    if (/^[\d\s\-\/:.,¥￥円]+$/.test(L)) continue;
    // \b penting: tanpa sempadan perkataan, "HOTEL" akan padan "tel" dan
    // nama hotel jadi terlangkau.
    if (/(\btel\b|\btel[:.\s]*\+?[0-9]|電話|〒|\breceipt\b|領収|レシート|\binvoice\b)/i.test(L)) continue;
    out.title = L; break;
  }
  const d = text.match(/(20\d{2})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/);
  if (d) out.date = d[1] + '-' + ('0' + d[2]).slice(-2) + '-' + ('0' + d[3]).slice(-2);
  return out;
}

// ---- Folder Drive untuk resit (dibuat sekali, guna semula) ----
function receiptFolder_() {
  var name = 'KNM Japan 2026 — Resit';
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

// ---- Logging ringkas (Semakan #5 ship-safe) ----
function log_(action, tab, row) {
  try {
    var lg = SS.getSheetByName('_log');
    if (!lg) { lg = SS.insertSheet('_log'); lg.appendRow(['time','action','tab','row']); }
    lg.appendRow([new Date(), action, tab, row]);
  } catch(e){}
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
