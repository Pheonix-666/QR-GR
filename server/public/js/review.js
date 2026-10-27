// Customer Review Mobile Screen Script
document.addEventListener('DOMContentLoaded', () => {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const businessId = pathParts[pathParts.length - 1];

  let currentBusiness = null;

  const elements = {
    businessName: document.getElementById('businessName'),
    businessInitial: document.getElementById('businessInitial'),
    categoryBadge: document.getElementById('categoryBadge'),
    reviewTextArea: document.getElementById('reviewTextArea'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    proceedBtn: document.getElementById('proceedBtn'),
    proceedBtnText: document.getElementById('proceedBtnText'),
    copyToast: document.getElementById('copyToast')
  };

  const urlParams = new URLSearchParams(window.location.search);
  const qrId = urlParams.get('qr') || '';

  // Load Random Template & Business Info
  async function loadTemplate(isShuffle = false) {
    try {
      elements.shuffleBtn.disabled = true;
      elements.shuffleBtn.style.opacity = '0.6';

      let fetchUrl = `/api/review/${encodeURIComponent(businessId)}/random-template`;
      const queryParts = [];
      if (qrId) queryParts.push(`qr=${encodeURIComponent(qrId)}`);
      if (isShuffle) queryParts.push('shuffle=true');
      if (queryParts.length > 0) fetchUrl += `?${queryParts.join('&')}`;

      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Failed to load review data');

      const data = await res.json();
      currentBusiness = data.business;
      const template = data.template;

      elements.businessName.textContent = currentBusiness.name;
      elements.businessInitial.textContent = currentBusiness.name.charAt(0).toUpperCase();
      elements.categoryBadge.textContent = currentBusiness.category.toUpperCase();

      elements.reviewTextArea.value = template ? template.text : '';
    } catch (err) {
      console.error(err);
      elements.businessName.textContent = 'Business Review';
      elements.reviewTextArea.value = 'Great experience! Friendly staff, excellent service, and great attention to detail. Highly recommend!';
    } finally {
      elements.shuffleBtn.disabled = false;
      elements.shuffleBtn.style.opacity = '1';
    }
  }

  // Shuffle button
  elements.shuffleBtn.addEventListener('click', () => {
    loadTemplate(true);
  });

  // Copy to Clipboard
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API fallback:', err);
      }
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  function showToast() {
    elements.copyToast.classList.add('show');
    setTimeout(() => {
      elements.copyToast.classList.remove('show');
    }, 4500);
  }

  // Primary Action: Copy & Open Google Review
  elements.proceedBtn.addEventListener('click', async () => {
    const textToCopy = elements.reviewTextArea.value.trim();
    if (!textToCopy) {
      alert('Please enter or keep some review text before proceeding.');
      elements.reviewTextArea.focus();
      return;
    }

    const copied = await copyToClipboard(textToCopy);

    const origText = elements.proceedBtnText.textContent;
    elements.proceedBtnText.textContent = copied ? '✅ Copied! Opening...' : 'Opening...';
    elements.proceedBtn.style.background = '#16a34a';

    showToast();

    const destinationUrl = currentBusiness?.review_link || 'https://www.google.com';

    // Fallback direct link in case of aggressive popup blockers
    let fallbackEl = document.getElementById('manualFallbackLink');
    if (!fallbackEl) {
      fallbackEl = document.createElement('div');
      fallbackEl.id = 'manualFallbackLink';
      fallbackEl.style.cssText = 'margin-top: 10px; text-align: center; font-size: 13px; font-weight: 700; color: #1a73e8;';
      elements.proceedBtn.parentNode.appendChild(fallbackEl);
    }
    fallbackEl.innerHTML = `<a href="${destinationUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">👉 Tap here to open Google Review directly</a>`;
    fallbackEl.style.display = 'block';

    try {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Popup blocked');
    }

    setTimeout(() => {
      elements.proceedBtnText.textContent = origText;
      elements.proceedBtn.style.background = '';
    }, 2500);
  });

  loadTemplate();
});
