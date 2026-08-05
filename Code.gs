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
  var out = msg.join('\n');
  Logger.log(out);
  try { SpreadsheetApp.getUi().alert('Setup KNM', out, SpreadsheetApp.getUi().ButtonSet.OK); } catch(e){}
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
    // EXPENSE_PIN scope: tambah belanja SAHAJA. Bukan edit, bukan delete, bukan tab lain.
    if (isExpense && !(action === 'add' && tab === 'Expenses')) {
      return json({ ok:false, error:'PIN ni untuk tambah belanja sahaja' });
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
