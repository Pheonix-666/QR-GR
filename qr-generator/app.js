// Google Review QR & Link Creator Script
document.addEventListener('DOMContentLoaded', () => {
  // Determine backend server origin (defaults to http://localhost:3000 if opened as a static file)
  const SERVER_URL = (window.location.protocol.startsWith('http')) 
    ? window.location.origin 
    : 'http://localhost:3000';

  // DOM Elements
  const serverStatusPill = document.getElementById('serverStatusPill');
  const serverStatusText = document.getElementById('serverStatusText');

  const createLinkForm = document.getElementById('createLinkForm');
  const reviewUrlInput = document.getElementById('reviewUrlInput');
  const businessNameInput = document.getElementById('businessNameInput');
  const categorySelect = document.getElementById('categorySelect');
  const generateBtn = document.getElementById('generateBtn');

  const placeholderBox = document.getElementById('placeholderBox');
  const resultBox = document.getElementById('resultBox');
  const qrPreviewImg = document.getElementById('qrPreviewImg');
  const resultBizName = document.getElementById('resultBizName');
  const resultCatBadge = document.getElementById('resultCatBadge');
  const serverScanUrl = document.getElementById('serverScanUrl');

  const copyScanUrlBtn = document.getElementById('copyScanUrlBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const printBtn = document.getElementById('printBtn');
  const testScanBtn = document.getElementById('testScanBtn');

  const qrsTableBody = document.getElementById('qrsTableBody');
  const refreshListBtn = document.getElementById('refreshListBtn');

  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Category Icon Map
  const categoryIcons = {
    hotels: '🏨',
    lodges: '🌲',
    restaurants: '🍽️',
    cafes: '☕',
    'gift shops': '🎁',
    salons: '💆',
    healthcare: '🏥',
    retail: '🛍️',
    services: '💼'
  };

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ----------------------------------------------------
  // 1. Check Server Connection & Load Categories
  // ----------------------------------------------------
  async function checkServerAndLoadCategories() {
    try {
      const res = await fetch(`${SERVER_URL}/api/categories`);
      if (!res.ok) throw new Error('Server returned ' + res.status);

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Server is online
      serverStatusPill.className = 'server-status-pill online';
      serverStatusText.textContent = `Server Connected (${SERVER_URL.replace(/https?:\/\//, '')})`;

      // Populate dropdown
      categorySelect.innerHTML = '<option value="" disabled selected>-- Select Business Category --</option>';
      data.data.forEach(cat => {
        const icon = categoryIcons[cat.name] || '🏷️';
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${icon} ${cat.display_name}`;
        categorySelect.appendChild(opt);
      });

    } catch (err) {
      serverStatusPill.className = 'server-status-pill offline';
      serverStatusText.textContent = 'Server Offline (Start server with "node server/server.js")';
      categorySelect.innerHTML = '<option value="" disabled selected>⚠️ Cannot connect to server</option>';
    }
  }

  // ----------------------------------------------------
  // 2. Generate Link & QR Code
  // ----------------------------------------------------
  createLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const reviewLink = reviewUrlInput.value.trim();
    const category = categorySelect.value;
    const name = businessNameInput.value.trim();

    if (!reviewLink || !category) {
      alert('Please enter your Google Review Link and select a Category.');
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>Generating QR...</span>';

    try {
      const res = await fetch(`${SERVER_URL}/api/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_link: reviewLink, category, name })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate QR');

      const qr = data.qr;

      // Show Result Card
      placeholderBox.classList.add('hidden');
      resultBox.classList.remove('hidden');

      qrPreviewImg.src = qr.dataUrl;
      resultBizName.textContent = qr.name;
      resultCatBadge.textContent = qr.category.toUpperCase();
      serverScanUrl.value = qr.scanUrl;

      // Buttons
      downloadPngBtn.href = qr.dataUrl;
      downloadPngBtn.download = `${qr.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-google-review-qr.png`;
      testScanBtn.href = qr.scanUrl;

      showToast('🎉 QR Code Generated & Linked to Server!');
      loadActiveQrs();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>Generate QR Code</span>
      `;
    }
  });

  // Copy scan link
  copyScanUrlBtn.addEventListener('click', () => {
    if (!serverScanUrl.value) return;
    navigator.clipboard.writeText(serverScanUrl.value);
    showToast('Server scan link copied!');
  });

  // Print
  printBtn.addEventListener('click', () => window.print());

  // ----------------------------------------------------
  // 3. Load Active Generated QRs from Server
  // ----------------------------------------------------
  async function loadActiveQrs() {
    qrsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading from server...</td></tr>';

    try {
      const res = await fetch(`${SERVER_URL}/api/businesses`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const list = data.data;
      if (!list || list.length === 0) {
        qrsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No QR links created yet.</td></tr>';
        return;
      }

      qrsTableBody.innerHTML = '';
      list.forEach(biz => {
        const scanUrl = `${SERVER_URL}/review/${biz.id}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${biz.name}</strong></td>
          <td><span class="cat-pill">${biz.category}</span></td>
          <td><a href="${biz.review_link}" target="_blank" class="truncate" title="${biz.review_link}">${biz.review_link}</a></td>
          <td><span class="scans-pill">${biz.total_scans || 0} scans</span></td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-sm btn-outline view-btn" data-id="${biz.id}" data-name="${biz.name}" data-cat="${biz.category}">View QR</button>
              <a href="${scanUrl}" target="_blank" class="btn btn-sm btn-secondary">Test</a>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${biz.id}">Delete</button>
            </div>
          </td>
        `;
        qrsTableBody.appendChild(tr);
      });

      // Bind View QR buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          await showBusinessQr(btn.dataset.id, btn.dataset.name, btn.dataset.cat);
        });
      });

      // Bind Delete buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this QR code?')) {
            await deleteBusiness(btn.dataset.id);
          }
        });
      });

    } catch (err) {
      qrsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Server error: ${err.message}</td></tr>`;
    }
  }

  // View existing QR code
  async function showBusinessQr(bizId, name, category) {
    try {
      const res = await fetch(`${SERVER_URL}/api/businesses/${bizId}/qr`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      placeholderBox.classList.add('hidden');
      resultBox.classList.remove('hidden');

      qrPreviewImg.src = data.dataUrl;
      resultBizName.textContent = name;
      resultCatBadge.textContent = category.toUpperCase();
      serverScanUrl.value = data.scanUrl;

      downloadPngBtn.href = data.dataUrl;
      downloadPngBtn.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-google-review-qr.png`;
      testScanBtn.href = data.scanUrl;

      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast(`Showing QR for ${name}`);
    } catch (e) {
      alert('Failed to load QR: ' + e.message);
    }
  }

  // Delete business
  async function deleteBusiness(bizId) {
    try {
      const res = await fetch(`${SERVER_URL}/api/businesses/${bizId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast('QR Code deleted');
      loadActiveQrs();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  refreshListBtn.addEventListener('click', loadActiveQrs);

  // Initial Load
  checkServerAndLoadCategories();
  loadActiveQrs();
});
