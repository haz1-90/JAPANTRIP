// ===== KNM JAPAN 2026 — Apps Script Backend =====
// Password TAK hardcode. Disimpan dalam Script Properties (key: ADMIN_PIN).
// Set dulu: Project Settings > Script Properties > Add > ADMIN_PIN = <your pin>
//
// DEPLOY: Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone   (WAJIB — supaya app boleh fetch tanpa login)
// Kalau redeploy & URL berubah, update API_URL dalam index.html.

const SS = SpreadsheetApp.getActiveSpreadsheet();
const TABS = ['Itinerary','Accommodation','Places','Parking','Reminders','Info','Budget'];

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
    const stored = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
    if (!stored) return json({ ok:false, error:'ADMIN_PIN belum di-set dalam Script Properties' });
    if (String(body.pin) !== String(stored)) return json({ ok:false, error:'PIN salah' });

    const action = body.action;
    const tab = body.tab;
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
