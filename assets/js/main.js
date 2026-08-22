(function () {
  'use strict';

  /* ---------- Mobile nav (full-screen overlay, fade only) ----------
     Um único botão (o hambúrguer do header) abre e fecha o painel — não
     há botão de fechar duplicado. O painel some via opacity/visibility,
     não display:none, então os links recebem tabindex="-1" quando
     fechado para não ficarem focáveis "invisíveis". */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu-panel');
  var mobileMenuFocusables = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  var previousBodyOverflow = '';

  function setMenuFocusable(focusable) {
    mobileMenuFocusables.forEach(function (el) {
      if (focusable) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  }

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu de navegação');
    setMenuFocusable(true);
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onMenuKeydown);
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    setMenuFocusable(false);
    document.body.style.overflow = previousBodyOverflow;
    document.removeEventListener('keydown', onMenuKeydown);
  }

  function onMenuKeydown(e) {
    if (e.key === 'Escape') closeMobileMenu();
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMobileMenu(); else openMobileMenu();
    });
    mobileMenuFocusables.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', (!isOpen).toString());
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Header background on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 8 ? '0 4px 20px rgba(0,0,0,0.3)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Stats count-up ---------- */
  var statEls = document.querySelectorAll('.stat strong[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.floor(progress * (target - start) + start) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  /* =====================================================================
     LGPD — Cookie Consent
     Categories: necessary (always on), analytics, marketing
     ===================================================================== */
  var CONSENT_KEY = 'jl_cookie_consent_v1';

  function getConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) { /* localStorage unavailable */ }
    applyConsent(consent);
  }

  function applyConsent(consent) {
    document.dispatchEvent(new CustomEvent('jl:consent-updated', { detail: consent }));
    if (consent.analytics) {
      loadAnalyticsScripts();
    }
    if (consent.marketing) {
      loadMarketingScripts();
    }
  }

  function loadAnalyticsScripts() {
    if (window.__jlAnalyticsLoaded) return;
    window.__jlAnalyticsLoaded = true;
    // Ex.: injetar Google Analytics / GTM aqui somente após consentimento explícito.
    // var s = document.createElement('script'); s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    // document.head.appendChild(s);
  }

  function loadMarketingScripts() {
    if (window.__jlMarketingLoaded) return;
    window.__jlMarketingLoaded = true;
    // Ex.: injetar Meta Pixel / outros scripts de marketing aqui somente após consentimento explícito.
  }

  var banner = document.getElementById('cookie-banner');
  var prefsModal = document.getElementById('cookie-prefs');
  var analyticsToggle = document.getElementById('cookie-analytics');
  var marketingToggle = document.getElementById('cookie-marketing');

  function showBanner() {
    if (!banner) return;
    banner.classList.add('visible');
    document.body.classList.add('cookie-banner-open');
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('visible');
    document.body.classList.remove('cookie-banner-open');
  }
  function openPrefs() {
    if (prefsModal) prefsModal.classList.add('visible');
  }
  function closePrefs() {
    if (prefsModal) prefsModal.classList.remove('visible');
  }

  var existingConsent = getConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  } else {
    showBanner();
  }

  var btnAcceptAll = document.getElementById('cookie-accept-all');
  var btnRejectAll = document.getElementById('cookie-reject-all');
  var btnOpenPrefs = document.getElementById('cookie-open-prefs');
  var btnSavePrefs = document.getElementById('cookie-save-prefs');
  var btnClosePrefs = document.getElementById('cookie-close-prefs');

  if (btnAcceptAll) btnAcceptAll.addEventListener('click', function () {
    saveConsent({ necessary: true, analytics: true, marketing: true, date: new Date().toISOString() });
    hideBanner();
  });

  if (btnRejectAll) btnRejectAll.addEventListener('click', function () {
    saveConsent({ necessary: true, analytics: false, marketing: false, date: new Date().toISOString() });
    hideBanner();
  });

  if (btnOpenPrefs) btnOpenPrefs.addEventListener('click', function () {
    var current = getConsent() || { analytics: false, marketing: false };
    if (analyticsToggle) analyticsToggle.checked = !!current.analytics;
    if (marketingToggle) marketingToggle.checked = !!current.marketing;
    openPrefs();
  });

  if (btnClosePrefs) btnClosePrefs.addEventListener('click', closePrefs);

  if (btnSavePrefs) btnSavePrefs.addEventListener('click', function () {
    saveConsent({
      necessary: true,
      analytics: analyticsToggle ? analyticsToggle.checked : false,
      marketing: marketingToggle ? marketingToggle.checked : false,
      date: new Date().toISOString()
    });
    closePrefs();
    hideBanner();
  });

  if (prefsModal) {
    prefsModal.addEventListener('click', function (e) {
      if (e.target === prefsModal) closePrefs();
    });
  }
})();
