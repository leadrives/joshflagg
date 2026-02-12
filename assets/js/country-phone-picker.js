/**
 * Country Phone Picker
 * - Searchable dropdown with 80+ countries (GCC, Asia, Europe, Americas, Oceania)
 * - Auto-detects user country via IP geolocation
 * - Modern, accessible UI
 */
(function () {
  'use strict';

  // ── Country Data ──────────────────────────────────────────────
  // code = ISO 3166-1 alpha-2, dial = calling code, flag = emoji
  const COUNTRIES = [
    // ─── GCC ───
    { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia',         dial: '+966', flag: '🇸🇦' },
    { code: 'QA', name: 'Qatar',                dial: '+974', flag: '🇶🇦' },
    { code: 'KW', name: 'Kuwait',               dial: '+965', flag: '🇰🇼' },
    { code: 'BH', name: 'Bahrain',              dial: '+973', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman',                 dial: '+968', flag: '🇴🇲' },

    // ─── Middle East & North Africa ───
    { code: 'JO', name: 'Jordan',               dial: '+962', flag: '🇯🇴' },
    { code: 'LB', name: 'Lebanon',              dial: '+961', flag: '🇱🇧' },
    { code: 'EG', name: 'Egypt',                dial: '+20',  flag: '🇪🇬' },
    { code: 'IQ', name: 'Iraq',                 dial: '+964', flag: '🇮🇶' },
    { code: 'MA', name: 'Morocco',              dial: '+212', flag: '🇲🇦' },
    { code: 'TN', name: 'Tunisia',              dial: '+216', flag: '🇹🇳' },
    { code: 'PS', name: 'Palestine',            dial: '+970', flag: '🇵🇸' },

    // ─── South Asia ───
    { code: 'IN', name: 'India',                dial: '+91',  flag: '🇮🇳' },
    { code: 'PK', name: 'Pakistan',             dial: '+92',  flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh',           dial: '+880', flag: '🇧🇩' },
    { code: 'LK', name: 'Sri Lanka',            dial: '+94',  flag: '🇱🇰' },
    { code: 'NP', name: 'Nepal',                dial: '+977', flag: '🇳🇵' },

    // ─── East & Southeast Asia ───
    { code: 'CN', name: 'China',                dial: '+86',  flag: '🇨🇳' },
    { code: 'JP', name: 'Japan',                dial: '+81',  flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea',          dial: '+82',  flag: '🇰🇷' },
    { code: 'HK', name: 'Hong Kong',            dial: '+852', flag: '🇭🇰' },
    { code: 'SG', name: 'Singapore',            dial: '+65',  flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia',             dial: '+60',  flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand',             dial: '+66',  flag: '🇹🇭' },
    { code: 'PH', name: 'Philippines',          dial: '+63',  flag: '🇵🇭' },
    { code: 'ID', name: 'Indonesia',            dial: '+62',  flag: '🇮🇩' },
    { code: 'VN', name: 'Vietnam',              dial: '+84',  flag: '🇻🇳' },
    { code: 'TW', name: 'Taiwan',               dial: '+886', flag: '🇹🇼' },

    // ─── Europe ───
    { code: 'GB', name: 'United Kingdom',       dial: '+44',  flag: '🇬🇧' },
    { code: 'FR', name: 'France',               dial: '+33',  flag: '🇫🇷' },
    { code: 'DE', name: 'Germany',              dial: '+49',  flag: '🇩🇪' },
    { code: 'IT', name: 'Italy',                dial: '+39',  flag: '🇮🇹' },
    { code: 'ES', name: 'Spain',                dial: '+34',  flag: '🇪🇸' },
    { code: 'PT', name: 'Portugal',             dial: '+351', flag: '🇵🇹' },
    { code: 'NL', name: 'Netherlands',          dial: '+31',  flag: '🇳🇱' },
    { code: 'BE', name: 'Belgium',              dial: '+32',  flag: '🇧🇪' },
    { code: 'CH', name: 'Switzerland',          dial: '+41',  flag: '🇨🇭' },
    { code: 'AT', name: 'Austria',              dial: '+43',  flag: '🇦🇹' },
    { code: 'SE', name: 'Sweden',               dial: '+46',  flag: '🇸🇪' },
    { code: 'NO', name: 'Norway',               dial: '+47',  flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark',              dial: '+45',  flag: '🇩🇰' },
    { code: 'FI', name: 'Finland',              dial: '+358', flag: '🇫🇮' },
    { code: 'IE', name: 'Ireland',              dial: '+353', flag: '🇮🇪' },
    { code: 'PL', name: 'Poland',               dial: '+48',  flag: '🇵🇱' },
    { code: 'CZ', name: 'Czech Republic',       dial: '+420', flag: '🇨🇿' },
    { code: 'GR', name: 'Greece',               dial: '+30',  flag: '🇬🇷' },
    { code: 'RO', name: 'Romania',              dial: '+40',  flag: '🇷🇴' },
    { code: 'HU', name: 'Hungary',              dial: '+36',  flag: '🇭🇺' },
    { code: 'RU', name: 'Russia',               dial: '+7',   flag: '🇷🇺' },
    { code: 'UA', name: 'Ukraine',              dial: '+380', flag: '🇺🇦' },
    { code: 'TR', name: 'Turkey',               dial: '+90',  flag: '🇹🇷' },

    // ─── North America ───
    { code: 'US', name: 'United States',        dial: '+1',   flag: '🇺🇸' },
    { code: 'CA', name: 'Canada',               dial: '+1',   flag: '🇨🇦' },
    { code: 'MX', name: 'Mexico',               dial: '+52',  flag: '🇲🇽' },

    // ─── Central America & Caribbean ───
    { code: 'PA', name: 'Panama',               dial: '+507', flag: '🇵🇦' },
    { code: 'CR', name: 'Costa Rica',           dial: '+506', flag: '🇨🇷' },
    { code: 'JM', name: 'Jamaica',              dial: '+1876', flag: '🇯🇲' },

    // ─── South America ───
    { code: 'BR', name: 'Brazil',               dial: '+55',  flag: '🇧🇷' },
    { code: 'AR', name: 'Argentina',            dial: '+54',  flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia',             dial: '+57',  flag: '🇨🇴' },
    { code: 'CL', name: 'Chile',                dial: '+56',  flag: '🇨🇱' },
    { code: 'PE', name: 'Peru',                 dial: '+51',  flag: '🇵🇪' },
    { code: 'EC', name: 'Ecuador',              dial: '+593', flag: '🇪🇨' },
    { code: 'VE', name: 'Venezuela',            dial: '+58',  flag: '🇻🇪' },
    { code: 'UY', name: 'Uruguay',              dial: '+598', flag: '🇺🇾' },

    // ─── Oceania ───
    { code: 'AU', name: 'Australia',            dial: '+61',  flag: '🇦🇺' },
    { code: 'NZ', name: 'New Zealand',          dial: '+64',  flag: '🇳🇿' },
    { code: 'FJ', name: 'Fiji',                 dial: '+679', flag: '🇫🇯' },

    // ─── Africa ───
    { code: 'ZA', name: 'South Africa',         dial: '+27',  flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria',              dial: '+234', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya',                dial: '+254', flag: '🇰🇪' },
    { code: 'GH', name: 'Ghana',                dial: '+233', flag: '🇬🇭' },
    { code: 'ET', name: 'Ethiopia',             dial: '+251', flag: '🇪🇹' },
  ];

  // ── Helpers ───────────────────────────────────────────────────
  const DEFAULT_CODE = 'AE'; // fallback

  function findByISO(iso) {
    return COUNTRIES.find(c => c.code === iso) || COUNTRIES.find(c => c.code === DEFAULT_CODE);
  }

  // ── Initialise picker(s) ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const pickers = document.querySelectorAll('.country-picker');
    if (!pickers.length) return;

    pickers.forEach(initPicker);
  });

  function initPicker(picker) {
    const btn       = picker.querySelector('.country-picker-btn');
    const dropdown  = picker.querySelector('.country-picker-dropdown');
    const searchEl  = picker.querySelector('.cp-search');
    const listEl    = picker.querySelector('.cp-list');
    const flagEl    = picker.querySelector('.cp-flag');
    const codeEl    = picker.querySelector('.cp-code');
    const hiddenIn  = picker.parentElement.querySelector('input[name="countryCode"]');

    let isOpen = false;

    // Build list
    function renderList(filter) {
      const term = (filter || '').toLowerCase();
      listEl.innerHTML = '';

      // Group labels for visual separation
      const groups = {
        'GCC': ['AE','SA','QA','KW','BH','OM'],
        'Middle East & Africa': ['JO','LB','EG','IQ','MA','TN','PS','ZA','NG','KE','GH','ET'],
        'South Asia': ['IN','PK','BD','LK','NP'],
        'East & SE Asia': ['CN','JP','KR','HK','SG','MY','TH','PH','ID','VN','TW'],
        'Europe': ['GB','FR','DE','IT','ES','PT','NL','BE','CH','AT','SE','NO','DK','FI','IE','PL','CZ','GR','RO','HU','RU','UA','TR'],
        'Americas': ['US','CA','MX','PA','CR','JM','BR','AR','CO','CL','PE','EC','VE','UY'],
        'Oceania': ['AU','NZ','FJ']
      };

      Object.entries(groups).forEach(([groupName, codes]) => {
        const groupCountries = codes
          .map(c => COUNTRIES.find(cc => cc.code === c))
          .filter(Boolean)
          .filter(c => {
            if (!term) return true;
            return c.name.toLowerCase().includes(term)
              || c.dial.includes(term)
              || c.code.toLowerCase().includes(term);
          });

        if (!groupCountries.length) return;

        // Group header
        const header = document.createElement('li');
        header.className = 'cp-group-header';
        header.textContent = groupName;
        header.setAttribute('role', 'presentation');
        listEl.appendChild(header);

        groupCountries.forEach(country => {
          const li = document.createElement('li');
          li.className = 'cp-option';
          li.setAttribute('role', 'option');
          li.setAttribute('data-code', country.code);
          li.setAttribute('data-dial', country.dial);
          li.innerHTML = `
            <span class="cp-opt-flag">${country.flag}</span>
            <span class="cp-opt-name">${country.name}</span>
            <span class="cp-opt-dial">${country.dial}</span>
          `;
          li.addEventListener('click', function () {
            selectCountry(country);
          });
          listEl.appendChild(li);
        });
      });
    }

    function selectCountry(country) {
      flagEl.textContent = country.flag;
      codeEl.textContent = country.dial;
      if (hiddenIn) hiddenIn.value = country.dial;
      close();
    }

    function open() {
      isOpen = true;
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      searchEl.value = '';
      renderList('');
      // Focus search after animation
      requestAnimationFrame(() => searchEl.focus());
    }

    function close() {
      isOpen = false;
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    // Toggle
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen ? close() : open();
    });

    // Search
    searchEl.addEventListener('input', function () {
      renderList(this.value);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!picker.contains(e.target)) close();
    });

    // Keyboard navigation
    searchEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const first = listEl.querySelector('.cp-option');
        if (first) first.focus();
      }
    });

    listEl.addEventListener('keydown', function (e) {
      const focused = document.activeElement;
      if (!focused || !focused.classList.contains('cp-option')) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        let next = focused.nextElementSibling;
        while (next && !next.classList.contains('cp-option')) next = next.nextElementSibling;
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        let prev = focused.previousElementSibling;
        while (prev && !prev.classList.contains('cp-option')) prev = prev.previousElementSibling;
        if (prev) prev.focus();
        else searchEl.focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        focused.click();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    // Make options focusable
    listEl.addEventListener('DOMNodeInserted', function () {
      listEl.querySelectorAll('.cp-option').forEach(li => {
        li.setAttribute('tabindex', '0');
      });
    });

    // Initial render
    renderList('');

    // ── IP-based auto-detection ────────────────────────────────
    // The form-submission-handler.js already calls ipapi.co.
    // We hook into a global event or re-fetch if needed.
    if (window.__countryPickerDetectedISO) {
      const c = findByISO(window.__countryPickerDetectedISO);
      if (c) selectCountry(c);
    }

    // Listen for custom event from form-submission-handler
    window.addEventListener('countryDetected', function (e) {
      const c = findByISO(e.detail.countryCode);
      if (c) selectCountry(c);
    });
  }

  // ── Expose for external use ──────────────────────────────────
  window.CountryPhonePicker = { COUNTRIES, findByISO };
})();
