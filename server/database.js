const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'reviews.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    icon TEXT DEFAULT 'building',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    text TEXT NOT NULL,
    sentiment TEXT DEFAULT 'positive',
    tags TEXT DEFAULT 'general',
    normalized_hash TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
  CREATE INDEX IF NOT EXISTS idx_templates_hash ON templates(normalized_hash);

  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    review_link TEXT NOT NULL,
    link_type TEXT DEFAULT 'google_review', -- 'google_review' or 'google_form'
    form_entry_id TEXT DEFAULT '',
    brand_color TEXT DEFAULT '#1a73e8',
    frame_style TEXT DEFAULT 'branded-card',
    call_to_action TEXT DEFAULT 'Scan to share your feedback & review on Google!',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id TEXT NOT NULL,
    template_id INTEGER NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    user_agent TEXT,
    FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY(template_id) REFERENCES templates(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_scan_history_biz ON scan_history(business_id);

  CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    title TEXT DEFAULT 'Default Counter QR',
    assigned_template_id INTEGER,
    scan_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(business_id) REFERENCES businesses(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_qr_codes_biz ON qr_codes(business_id);
`);

// Normalize text for duplicate detection (lowercase, remove excess spaces and punctuation)
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper methods
const dbHelpers = {
  db,
  normalizeText,

  // Categories
  getAllCategories: () => {
    return db.prepare('SELECT * FROM categories ORDER BY display_name ASC').all();
  },

  upsertCategory: (name, displayName, icon = 'tag') => {
    const stmt = db.prepare(`
      INSERT INTO categories (name, display_name, icon)
      VALUES (?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET display_name = excluded.display_name
    `);
    return stmt.run(name.toLowerCase().trim(), displayName.trim(), icon);
  },

  // Templates
  countTemplatesByCategory: () => {
    return db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM templates 
      GROUP BY category
    `).all();
  },

  getTemplates: ({ category, search, limit = 50, offset = 0 }) => {
    let query = 'SELECT * FROM templates WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category.toLowerCase().trim());
    }

    if (search && search.trim()) {
      query += ' AND (text LIKE ? OR tags LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const totalCountQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const totalStmt = db.prepare(totalCountQuery);
    const total = totalStmt.get(...params.slice(0, -2))?.total || 0;

    const rows = db.prepare(query).all(...params);
    return { rows, total };
  },

  addTemplate: (category, text, sentiment = 'positive', tags = 'general') => {
    const cleanText = text.trim();
    if (!cleanText) throw new Error('Template text cannot be empty');

    const cleanCategory = category.toLowerCase().trim();
    const hash = normalizeText(cleanText);

    // Check duplicate within this category
    const existing = db.prepare('SELECT id FROM templates WHERE normalized_hash = ? AND category = ?').get(hash, cleanCategory);
    if (existing) {
      return { success: false, duplicate: true, existingId: existing.id };
    }

    // Ensure category exists
    db.prepare(`
      INSERT OR IGNORE INTO categories (name, display_name) 
      VALUES (?, ?)
    `).run(cleanCategory, cleanCategory.charAt(0).toUpperCase() + cleanCategory.slice(1));

    const stmt = db.prepare(`
      INSERT INTO templates (category, text, sentiment, tags, normalized_hash)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(cleanCategory, cleanText, sentiment, tags, hash);
    return { success: true, id: info.lastInsertRowid };
  },

  updateTemplate: (id, text, category, sentiment, tags) => {
    const cleanText = text.trim();
    const hash = normalizeText(cleanText);
    const stmt = db.prepare(`
      UPDATE templates 
      SET text = ?, category = ?, sentiment = ?, tags = ?, normalized_hash = ?
      WHERE id = ?
    `);
    return stmt.run(cleanText, category.toLowerCase().trim(), sentiment, tags, hash, id);
  },

  deleteTemplate: (id) => {
    return db.prepare('DELETE FROM templates WHERE id = ?').run(id);
  },

  clearTemplatesByCategory: (category) => {
    return db.prepare('DELETE FROM templates WHERE category = ?').run(category.toLowerCase().trim());
  },

  // Bulk import with duplicate detection (scoped per category)
  bulkImportTemplates: (items) => {
    // items: array of { category, text, sentiment, tags }
    let imported = 0;
    let duplicates = 0;
    let skipped = 0;

    const checkStmt = db.prepare('SELECT id FROM templates WHERE normalized_hash = ? AND category = ?');
    const insertCatStmt = db.prepare(`
      INSERT OR IGNORE INTO categories (name, display_name) 
      VALUES (?, ?)
    `);
    const insertStmt = db.prepare(`
      INSERT INTO templates (category, text, sentiment, tags, normalized_hash)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const text = (row.text || '').trim();
        const category = (row.category || 'general').toLowerCase().trim();
        const sentiment = (row.sentiment || 'positive').trim();
        const tags = (row.tags || '').trim();

        if (!text) {
          skipped++;
          continue;
        }

        const hash = normalizeText(text);
        const exists = checkStmt.get(hash, category);
        if (exists) {
          duplicates++;
          continue;
        }

        insertCatStmt.run(category, category.charAt(0).toUpperCase() + category.slice(1));
        insertStmt.run(category, text, sentiment, tags, hash);
        imported++;
      }
    });

    transaction(items);
    return { imported, duplicates, skipped, total: items.length };
  },

  // Randomizer with Recency Avoidance Buffer
  getRandomTemplateForBusiness: (businessId, category) => {
    const cleanCat = category.toLowerCase().trim();

    // 1. Get recent template IDs served to this business (e.g. last 15 scans)
    const recentScans = db.prepare(`
      SELECT template_id 
      FROM scan_history 
      WHERE business_id = ? 
      ORDER BY scanned_at DESC 
      LIMIT 15
    `).all(businessId);

    const recentIds = recentScans.map(r => r.template_id);

    // 2. Query candidates in this category excluding recent IDs
    let candidatesQuery = 'SELECT * FROM templates WHERE category = ?';
    let params = [cleanCat];

    if (recentIds.length > 0) {
      const placeholders = recentIds.map(() => '?').join(',');
      candidatesQuery += ` AND id NOT IN (${placeholders})`;
      params.push(...recentIds);
    }

    candidatesQuery += ' ORDER BY usage_count ASC, last_used_at ASC, RANDOM() LIMIT 20';
    let candidates = db.prepare(candidatesQuery).all(...params);

    // 3. Fallback: If all templates were in recent list (small dataset), pick any least recently used in this category
    if (!candidates || candidates.length === 0) {
      candidates = db.prepare(`
        SELECT * FROM templates 
        WHERE category = ? 
        ORDER BY last_used_at ASC, usage_count ASC, RANDOM() 
        LIMIT 10
      `).all(cleanCat);
    }

    // 4. Secondary Fallback: If no templates exist in this category at all, pick from general
    if (!candidates || candidates.length === 0) {
      candidates = db.prepare(`
        SELECT * FROM templates 
        ORDER BY RANDOM() 
        LIMIT 5
      `).all();
    }

    if (!candidates || candidates.length === 0) {
      return null;
    }

    // Pick random from top low-usage candidates
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    // Update usage stats & record scan history
    try {
      db.prepare(`
        UPDATE templates 
        SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(selected.id);

      db.prepare(`
        INSERT INTO scan_history (business_id, template_id) 
        VALUES (?, ?)
      `).run(businessId, selected.id);
    } catch (e) {
      console.error('Error logging scan history:', e);
    }

    return selected;
  },

  // Businesses
  getAllBusinesses: () => {
    return db.prepare(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM scan_history s WHERE s.business_id = b.id) as total_scans,
        (SELECT COUNT(*) FROM templates t WHERE t.category = b.category) as available_templates
      FROM businesses b 
      ORDER BY b.created_at DESC
    `).all();
  },

  getBusinessById: (id) => {
    return db.prepare(`
      SELECT b.*,
        (SELECT COUNT(*) FROM scan_history s WHERE s.business_id = b.id) as total_scans
      FROM businesses b 
      WHERE b.id = ?
    `).get(id);
  },

  createBusiness: ({ id, name, category, review_link, link_type, form_entry_id, brand_color, frame_style, call_to_action, notes }) => {
    const cleanCat = category.toLowerCase().trim();
    // Ensure category exists
    db.prepare(`
      INSERT OR IGNORE INTO categories (name, display_name) 
      VALUES (?, ?)
    `).run(cleanCat, cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1));

    const stmt = db.prepare(`
      INSERT INTO businesses (
        id, name, category, review_link, link_type, form_entry_id, 
        brand_color, frame_style, call_to_action, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name.trim(),
      cleanCat,
      review_link.trim(),
      link_type || 'google_review',
      (form_entry_id || '').trim(),
      brand_color || '#1a73e8',
      frame_style || 'branded-card',
      call_to_action || 'Scan to share your feedback & review on Google!',
      (notes || '').trim()
    );

    return dbHelpers.getBusinessById(id);
  },

  updateBusiness: (id, { name, category, review_link, link_type, form_entry_id, brand_color, frame_style, call_to_action, notes }) => {
    const cleanCat = category.toLowerCase().trim();
    db.prepare(`
      INSERT OR IGNORE INTO categories (name, display_name) 
      VALUES (?, ?)
    `).run(cleanCat, cleanCat.charAt(0).toUpperCase() + cleanCat.slice(1));

    const stmt = db.prepare(`
      UPDATE businesses 
      SET name = ?, category = ?, review_link = ?, link_type = ?, form_entry_id = ?,
          brand_color = ?, frame_style = ?, call_to_action = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      cleanCat,
      review_link.trim(),
      link_type || 'google_review',
      (form_entry_id || '').trim(),
      brand_color || '#1a73e8',
      frame_style || 'branded-card',
      call_to_action || 'Scan to share your feedback & review on Google!',
      (notes || '').trim(),
      id
    );

    return dbHelpers.getBusinessById(id);
  },

  // QR Code Management
  saveQrCode: ({ id, business_id, title, assigned_template_id = null }) => {
    const stmt = db.prepare(`
      INSERT INTO qr_codes (id, business_id, title, assigned_template_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        title = excluded.title,
        assigned_template_id = excluded.assigned_template_id
    `);
    stmt.run(id, business_id, title || 'Default Counter QR', assigned_template_id);
    return dbHelpers.getQrCodeById(id);
  },

  getQrCodesForBusiness: (business_id) => {
    return db.prepare(`
      SELECT q.*, t.text as assigned_template_text, t.category as assigned_template_category
      FROM qr_codes q
      LEFT JOIN templates t ON q.assigned_template_id = t.id
      WHERE q.business_id = ?
      ORDER BY q.created_at DESC
    `).all(business_id);
  },

  getQrCodeById: (id) => {
    return db.prepare(`
      SELECT q.*, t.text as assigned_template_text, t.category as assigned_template_category
      FROM qr_codes q
      LEFT JOIN templates t ON q.assigned_template_id = t.id
      WHERE q.id = ?
    `).get(id);
  },

  deleteQrCode: (id) => {
    return db.prepare('DELETE FROM qr_codes WHERE id = ?').run(id);
  },

  incrementQrScan: (id) => {
    return db.prepare('UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = ?').run(id);
  },

  deleteCategory: (name) => {
    const cleanCat = name.toLowerCase().trim();
    db.prepare('DELETE FROM templates WHERE category = ?').run(cleanCat);
    return db.prepare('DELETE FROM categories WHERE name = ?').run(cleanCat);
  },

  getStats: () => {
    const totalBusinesses = db.prepare('SELECT COUNT(*) as count FROM businesses').get().count;
    const totalTemplates = db.prepare('SELECT COUNT(*) as count FROM templates').get().count;
    const totalScans = db.prepare('SELECT COUNT(*) as count FROM scan_history').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalQrCodes = db.prepare('SELECT COUNT(*) as count FROM qr_codes').get().count;
    const categoryBreakdown = dbHelpers.countTemplatesByCategory();

    return {
      totalBusinesses,
      totalTemplates,
      totalScans,
      totalCategories,
      totalQrCodes,
      categoryBreakdown
    };
  }
};

module.exports = dbHelpers;
