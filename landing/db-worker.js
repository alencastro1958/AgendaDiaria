import sqlite3InitModule from './vendor/sqlite/sqlite3-bundler-friendly.mjs';

let db = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT,
    content TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(date);

  CREATE TABLE IF NOT EXISTS tags (
    note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tags_note ON tags(note_id);

  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    url TEXT, title TEXT, description TEXT, added_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_links_note ON links(note_id);

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    name TEXT, type TEXT, size INTEGER, duration INTEGER,
    data TEXT,
    added_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_attachments_note ON attachments(note_id, kind);

  CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title, content, content='notes', content_rowid='rowid'
  );
  CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
  END;
  CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
  END;
  CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
  END;
`;

async function initDb() {
  const sqlite3 = await sqlite3InitModule({ print: () => {}, printErr: (e) => console.error('[sqlite3]', e) });
  const poolUtil = await sqlite3.installOpfsSAHPoolVfs({ initialCapacity: 6 });
  db = new poolUtil.OpfsSAHPoolDb('/agendadiaria.db');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return { ok: true };
}

function _rows(sql, bind) {
  const resultRows = [];
  db.exec({ sql, bind, rowMode: 'object', resultRows });
  return resultRows;
}

function _noteShell(row) {
  return {
    id: row.id, date: row.date, title: row.title || '', content: row.content || '',
    tags: [], links: [], files: [], audioRecordings: [], videoRecordings: [], photos: [],
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function _hydrate(noteRows) {
  if (!noteRows.length) return [];
  const byId = new Map();
  const ids = [];
  for (const r of noteRows) { const n = _noteShell(r); byId.set(n.id, n); ids.push(n.id); }
  const ph = ids.map(() => '?').join(',');

  for (const t of _rows(`SELECT note_id, tag FROM tags WHERE note_id IN (${ph})`, ids)) {
    byId.get(t.note_id).tags.push(t.tag);
  }
  for (const l of _rows(`SELECT id, note_id, url, title, description, added_at FROM links WHERE note_id IN (${ph})`, ids)) {
    byId.get(l.note_id).links.push({ id: l.id, url: l.url, title: l.title, description: l.description, addedAt: l.added_at });
  }
  const kindField = { file: 'files', audio: 'audioRecordings', video: 'videoRecordings', photo: 'photos' };
  for (const a of _rows(`SELECT id, note_id, kind, name, type, size, duration, data, added_at FROM attachments WHERE note_id IN (${ph})`, ids)) {
    const target = byId.get(a.note_id)[kindField[a.kind]];
    if (!target) continue;
    const item = { id: a.id, name: a.name, data: a.data, addedAt: a.added_at };
    if (a.kind === 'file') { item.type = a.type; item.size = a.size; }
    else if (a.kind === 'photo') { item.size = a.size; }
    else { item.duration = a.duration; }
    target.push(item);
  }
  return ids.map((id) => byId.get(id));
}

function _replaceChildren(note) {
  db.exec({ sql: 'DELETE FROM tags WHERE note_id=?', bind: [note.id] });
  db.exec({ sql: 'DELETE FROM links WHERE note_id=?', bind: [note.id] });
  db.exec({ sql: 'DELETE FROM attachments WHERE note_id=?', bind: [note.id] });
  for (const tag of (note.tags || [])) {
    db.exec({ sql: 'INSERT INTO tags (note_id, tag) VALUES (?,?)', bind: [note.id, tag] });
  }
  for (const l of (note.links || [])) {
    db.exec({ sql: 'INSERT INTO links (id, note_id, url, title, description, added_at) VALUES (?,?,?,?,?,?)', bind: [l.id, note.id, l.url, l.title || '', l.description || '', l.addedAt || Date.now()] });
  }
  const attach = (kind, arr, extra) => {
    for (const a of (arr || [])) {
      const e = extra(a);
      db.exec({ sql: 'INSERT INTO attachments (id, note_id, kind, name, type, size, duration, data, added_at) VALUES (?,?,?,?,?,?,?,?,?)', bind: [a.id, note.id, kind, a.name || '', e.type || null, e.size || null, e.duration || null, a.data, a.addedAt || Date.now()] });
    }
  };
  attach('file', note.files, (a) => ({ type: a.type, size: a.size }));
  attach('audio', note.audioRecordings, (a) => ({ duration: a.duration }));
  attach('video', note.videoRecordings, (a) => ({ duration: a.duration }));
  attach('photo', note.photos, (a) => ({ size: a.size }));
}

function saveNote(note) {
  const now = Date.now();
  const createdAt = note.createdAt || now;
  db.exec('BEGIN');
  try {
    db.exec({
      sql: 'INSERT INTO notes (id, date, title, content, created_at, updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET date=excluded.date, title=excluded.title, content=excluded.content, updated_at=excluded.updated_at',
      bind: [note.id, note.date, note.title || '', note.content || '', createdAt, now]
    });
    _replaceChildren(note);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { id: note.id, createdAt, updatedAt: now };
}

function getByDate(date) {
  const rows = _rows('SELECT * FROM notes WHERE date=? ORDER BY updated_at DESC', [date]);
  return _hydrate(rows);
}

function getAll() {
  const rows = _rows('SELECT * FROM notes ORDER BY date DESC', []);
  return _hydrate(rows);
}

function getDatesWithNotes(year, month) {
  const prefix = year + '-' + String(month + 1).padStart(2, '0');
  const rows = _rows("SELECT DISTINCT date FROM notes WHERE date LIKE ?", [prefix + '%']);
  return rows.map((r) => r.date);
}

function deleteNote(id) {
  db.exec({ sql: 'DELETE FROM notes WHERE id=?', bind: [id] });
  return { ok: true };
}

function getById(id) {
  const rows = _rows('SELECT * FROM notes WHERE id=?', [id]);
  const hydrated = _hydrate(rows);
  return hydrated[0] || null;
}

function clearAll() {
  db.exec('DELETE FROM notes;');
  return { ok: true };
}

function search(query, dateFrom, dateTo) {
  let sql = `SELECT notes.* FROM notes_fts JOIN notes ON notes.rowid = notes_fts.rowid WHERE notes_fts MATCH ?`;
  const bind = [query];
  if (dateFrom) { sql += ' AND notes.date >= ?'; bind.push(dateFrom); }
  if (dateTo) { sql += ' AND notes.date <= ?'; bind.push(dateTo); }
  sql += ' ORDER BY notes.date DESC';
  const rows = _rows(sql, bind);
  return _hydrate(rows);
}

function migrateFromArray(notes) {
  db.exec('BEGIN');
  try {
    for (const n of notes) {
      db.exec({
        sql: 'INSERT OR IGNORE INTO notes (id, date, title, content, created_at, updated_at) VALUES (?,?,?,?,?,?)',
        bind: [n.id, n.date, n.title || '', n.content || '', n.createdAt || Date.now(), n.updatedAt || Date.now()]
      });
      _replaceChildren(n);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { migrated: notes.length };
}

function countNotes() {
  return _rows('SELECT COUNT(*) as c FROM notes', [])[0].c;
}

self.onmessage = async (ev) => {
  const { id, cmd, payload } = ev.data;
  try {
    let result;
    switch (cmd) {
      case 'init': result = await initDb(); break;
      case 'saveNote': result = saveNote(payload.note); break;
      case 'getByDate': result = getByDate(payload.date); break;
      case 'getAll': result = getAll(); break;
      case 'getDatesWithNotes': result = getDatesWithNotes(payload.year, payload.month); break;
      case 'deleteNote': result = deleteNote(payload.id); break;
      case 'getById': result = getById(payload.id); break;
      case 'clearAll': result = clearAll(); break;
      case 'search': result = search(payload.query, payload.dateFrom, payload.dateTo); break;
      case 'migrateFromArray': result = migrateFromArray(payload.notes); break;
      case 'countNotes': result = countNotes(); break;
      default: throw new Error('comando desconhecido: ' + cmd);
    }
    self.postMessage({ id, ok: true, result });
  } catch (e) {
    self.postMessage({ id, ok: false, error: String((e && e.message) || e) });
  }
};
