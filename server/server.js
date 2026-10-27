const express = require('express');
const path = require('path');
const QRCode = require('qrcode');
const cors = require('cors');

const dbHelpers = require('./database');
const { seedDatabase } = require('./seed-data');

// Run initial seed if necessary
seedDatabase(dbHelpers);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'qr-generator')));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// PART 1: QR GENERATOR API
// ==========================================

// Generate QR Code with Google Review link & category
app.post('/api/generate-qr', async (req, res) => {
  try {
    const { review_link, category, name } = req.body;
    if (!review_link || !category) {
      return res.status(400).json({ success: false, error: 'Google Review Link and Category are required' });
    }

    const bizName = (name && name.trim()) ? name.trim() : `${category.charAt(0).toUpperCase() + category.slice(1)} Business`;
    const slugBase = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${slugBase || 'biz'}-${Math.random().toString(36).substring(2, 7)}`;

    const isGoogleForm = review_link.includes('docs.google.com/forms');
    const entryMatch = review_link.match(/entry\.(\d+)/i);
    const form_entry_id = entryMatch ? `entry.${entryMatch[1]}` : '';

    const newBiz = dbHelpers.createBusiness({
      id,
      name: bizName,
      category: category.toLowerCase().trim(),
      review_link: review_link.trim(),
      link_type: isGoogleForm ? 'google_form' : 'google_review',
      form_entry_id
    });

    const qrId = `qr-${id}-main`;
    dbHelpers.saveQrCode({
      id: qrId,
      business_id: id,
      title: `${bizName} QR`,
      assigned_template_id: null
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const scanUrl = `${protocol}://${host}/review/${id}?qr=${qrId}`;

    const dataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 600,
      color: { dark: '#1a73e8', light: '#ffffff' }
    });

    res.status(201).json({
      success: true,
      qr: {
        id: qrId,
        business_id: id,
        name: bizName,
        category: newBiz.category,
        review_link: newBiz.review_link,
        scanUrl,
        dataUrl
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all generated QR codes / businesses
app.get('/api/businesses', (req, res) => {
  try {
    const businesses = dbHelpers.getAllBusinesses();
    res.json({ success: true, data: businesses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get business by ID
app.get('/api/businesses/:id', (req, res) => {
  try {
    const biz = dbHelpers.getBusinessById(req.params.id);
    if (!biz) return res.status(404).json({ success: false, error: 'Business not found' });
    res.json({ success: true, data: biz });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a business and its QR codes
app.delete('/api/businesses/:id', (req, res) => {
  try {
    dbHelpers.db.prepare('DELETE FROM businesses WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Business and QR Code removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate QR Code data URL for an existing business
app.get('/api/businesses/:id/qr', async (req, res) => {
  try {
    const biz = dbHelpers.getBusinessById(req.params.id);
    if (!biz) return res.status(404).json({ success: false, error: 'Business not found' });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const scanUrl = `${protocol}://${host}/review/${biz.id}`;

    const dataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 600,
      color: { dark: '#1a73e8', light: '#ffffff' }
    });

    res.json({
      success: true,
      scanUrl,
      dataUrl,
      business: biz
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PART 2: CATEGORY REVIEWS API
// ==========================================

// Get all predefined categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = dbHelpers.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get reviews for a category
app.get('/api/templates', (req, res) => {
  try {
    const { category, search, limit = 100, offset = 0 } = req.query;
    const result = dbHelpers.getTemplates({ category, search, limit, offset });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a single review template to a category
app.post('/api/templates', (req, res) => {
  try {
    const { category, text } = req.body;
    if (!category || !text) {
      return res.status(400).json({ success: false, error: 'Category and text are required' });
    }

    const result = dbHelpers.addTemplate(category, text);
    if (!result.success && result.duplicate) {
      return res.status(409).json({ success: false, error: 'This review template already exists in this category.' });
    }

    res.status(201).json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a review template
app.delete('/api/templates/:id', (req, res) => {
  try {
    dbHelpers.deleteTemplate(req.params.id);
    res.json({ success: true, message: 'Review template deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Overall stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = dbHelpers.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// CUSTOMER SCAN FLOW
// ==========================================

// Customer Scan Endpoint - Direct redirect for Google Forms with prefilled review!
app.get('/review/:businessId', (req, res) => {
  try {
    const biz = dbHelpers.getBusinessById(req.params.businessId);
    if (!biz) return res.status(404).send('Business not found');

    const qrId = req.query.qr;
    if (qrId) {
      dbHelpers.incrementQrScan(qrId);
    }

    // 1. Direct Redirect for Google Forms:
    // Automatically picks a random review from category dataset,
    // constructs the prefilled Google Form URL, and redirects immediately!
    if (biz.link_type === 'google_form' || biz.review_link.includes('docs.google.com/forms')) {
      const template = dbHelpers.getRandomTemplateForBusiness(biz.id, biz.category);
      const reviewText = template ? template.text : 'Great experience! Friendly staff, excellent service, and great attention to detail. Highly recommend!';

      const entryMatch = biz.review_link.match(/entry\.(\d+)/i);
      const entryParam = entryMatch ? `entry.${entryMatch[1]}` : (biz.form_entry_id || 'entry.1849204123');

      const baseFormUrl = biz.review_link.split('?')[0];
      const prefilledGoogleFormUrl = `${baseFormUrl}?usp=pp_url&${entryParam}=${encodeURIComponent(reviewText)}`;

      return res.redirect(302, prefilledGoogleFormUrl);
    }

    // 2. Mobile screen for Google Maps reviews
    res.sendFile(path.join(__dirname, 'public', 'review.html'));
  } catch (err) {
    res.sendFile(path.join(__dirname, 'public', 'review.html'));
  }
});

// Short URL redirect
app.get('/r/:qrId', (req, res) => {
  try {
    const qr = dbHelpers.getQrCodeById(req.params.qrId);
    if (!qr) return res.redirect('/');
    dbHelpers.incrementQrScan(qr.id);
    res.redirect(`/review/${qr.business_id}?qr=${qr.id}`);
  } catch (err) {
    res.redirect('/');
  }
});

// Fetch random review template for customer scan
app.get('/api/review/:businessId/random-template', (req, res) => {
  try {
    const biz = dbHelpers.getBusinessById(req.params.businessId);
    if (!biz) return res.status(404).json({ success: false, error: 'Business not found' });

    const qrId = req.query.qr;
    if (qrId) {
      dbHelpers.incrementQrScan(qrId);
    }

    // Pick random template from category using recency avoidance
    const template = dbHelpers.getRandomTemplateForBusiness(biz.id, biz.category);

    res.json({
      success: true,
      business: {
        id: biz.id,
        name: biz.name,
        category: biz.category,
        review_link: biz.review_link
      },
      template: template || {
        id: 0,
        category: biz.category,
        text: 'Great experience! Friendly staff, excellent service, and great attention to detail. Highly recommend!'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Google Review QR Generator Server Running`);
  console.log(`📍 Web Dashboard:   http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
