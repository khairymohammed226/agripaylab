/**
 * AgriPayLab - Smooth Page Transitions
 * ضيف هذا الملف في كل صفحة قبل </body> مباشرة:
 * <script src="js/transitions.js"></script>
 */

(function () {
  // ══════════════════════════════════════════
  // إعدادات الـ transitions - عدّلها زي ما تحب
  // ══════════════════════════════════════════
  var CONFIG = {
    duration: 380,          // مدة الـ animation بالـ ms
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // أنواع الـ transitions المتاحة:
    // 'fade'  → تلاشي بس
    // 'slide' → انزلاق بس
    // 'zoom'  → تكبير/تصغير بس
    // 'mix'   → مزيج ذكي (يختار حسب نوع الصفحة)
    mode: 'mix',

    // الصفحات اللي مش هيكون فيها transition عند الخروج منها
    // (مثلاً login و register ما نعملش عليهم exit animation)
    skipExitOn: ['login.html', 'register.html', 'verify.html'],

    // تعريف نوع كل صفحة للـ mix mode
    pageTypes: {
      'index.html':         'fade',
      'dashboard.html':     'zoom',
      'bank.html':          'slide-left',
      'wallet.html':        'slide-left',
      'card.html':          'slide-left',
      'add_card.html':      'slide-up',
      'profile.html':       'slide-right',
      'atm.html':           'slide-up',
      'atm-simulator.html': 'slide-up',
      'atm-deposit.html':   'slide-up',
      'about.html':         'fade',
      'contact.html':       'fade',
      'login.html':         'zoom',
      'register.html':      'zoom',
      'verify.html':        'fade',
    }
  };

  // ══════════════════════════════════════════
  // CSS الـ animations
  // ══════════════════════════════════════════
  var style = document.createElement('style');
  style.id = 'page-transition-styles';
  style.textContent = [
    /* overlay يظهر فوق الصفحة أثناء الانتقال */
    '.pt-overlay {',
    '  position: fixed; inset: 0; z-index: 99999;',
    '  pointer-events: none;',
    '  background: #0f172a;',
    '  opacity: 0;',
    '  transition: opacity ' + CONFIG.duration + 'ms ' + CONFIG.easing + ';',
    '}',
    '.pt-overlay.pt-in  { opacity: 1; }',
    '.pt-overlay.pt-out { opacity: 0; }',

    /* enter animation للصفحة الجديدة */
    '@keyframes pt-fade-in    { from { opacity:0 } to { opacity:1 } }',
    '@keyframes pt-slide-l-in { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }',
    '@keyframes pt-slide-r-in { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }',
    '@keyframes pt-slide-u-in { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }',
    '@keyframes pt-zoom-in    { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }',

    '.pt-animate-fade   { animation: pt-fade-in '    + CONFIG.duration + 'ms ' + CONFIG.easing + ' both; }',
    '.pt-animate-slide-left  { animation: pt-slide-l-in ' + CONFIG.duration + 'ms ' + CONFIG.easing + ' both; }',
    '.pt-animate-slide-right { animation: pt-slide-r-in ' + CONFIG.duration + 'ms ' + CONFIG.easing + ' both; }',
    '.pt-animate-slide-up    { animation: pt-slide-u-in ' + CONFIG.duration + 'ms ' + CONFIG.easing + ' both; }',
    '.pt-animate-zoom  { animation: pt-zoom-in '    + CONFIG.duration + 'ms ' + CONFIG.easing + ' both; }',

    /* تأثير على الـ body أثناء الخروج */
    'body.pt-exiting {',
    '  pointer-events: none;',
    '  transition: opacity ' + (CONFIG.duration * 0.6) + 'ms ' + CONFIG.easing + ',',
    '              transform ' + (CONFIG.duration * 0.6) + 'ms ' + CONFIG.easing + ';',
    '}',
    'body.pt-exit-fade  { opacity: 0; }',
    'body.pt-exit-slide-left  { opacity: 0; transform: translateX(-30px); }',
    'body.pt-exit-slide-right { opacity: 0; transform: translateX(30px); }',
    'body.pt-exit-slide-up    { opacity: 0; transform: translateY(-20px); }',
    'body.pt-exit-zoom  { opacity: 0; transform: scale(1.03); }',
  ].join('\n');
  document.head.appendChild(style);

  // ══════════════════════════════════════════
  // Helper functions
  // ══════════════════════════════════════════
  function getPageName(href) {
    if (!href) return '';
    var parts = href.split('/');
    var name = parts[parts.length - 1].split('?')[0].split('#')[0];
    return name || 'index.html';
  }

  function getCurrentPage() {
    return getPageName(window.location.pathname) || 'index.html';
  }

  function getTransitionType(pageName) {
    if (CONFIG.mode !== 'mix') return CONFIG.mode;
    return CONFIG.pageTypes[pageName] || 'fade';
  }

  function getExitClass(type) {
    return 'pt-exit-' + type;
  }

  function getEnterClass(type) {
    return 'pt-animate-' + type;
  }

  // ══════════════════════════════════════════
  // Enter animation (عند فتح الصفحة)
  // ══════════════════════════════════════════
  function runEnterAnimation() {
    var currentPage = getCurrentPage();
    var type = getTransitionType(currentPage);
    document.body.classList.add(getEnterClass(type));

    // شيل الكلاس بعد ما الـ animation خلصت
    setTimeout(function () {
      document.body.classList.remove(getEnterClass(type));
    }, CONFIG.duration + 50);
  }

  // ══════════════════════════════════════════
  // Exit animation + navigate
  // ══════════════════════════════════════════
  function navigateTo(href) {
    var targetPage = getPageName(href);
    var currentPage = getCurrentPage();

    // سكيب لو نفس الصفحة
    if (targetPage === currentPage) return;

    // سكيب exit animation لبعض الصفحات
    var skipExit = CONFIG.skipExitOn.indexOf(currentPage) !== -1;

    if (skipExit) {
      window.location.href = href;
      return;
    }

    // نوع الـ exit: معكوس نوع الصفحة اللي جاية
    var enterType = getTransitionType(targetPage);
    var exitType = enterType;

    // لو slide-left → exit يكون slide-right (معكوس)
    if (exitType === 'slide-left')  exitType = 'slide-right';
    else if (exitType === 'slide-right') exitType = 'slide-left';

    document.body.classList.add('pt-exiting', getExitClass(exitType));

    setTimeout(function () {
      window.location.href = href;
    }, CONFIG.duration * 0.55);
  }

  // ══════════════════════════════════════════
  // Intercept كل الـ links
  // ══════════════════════════════════════════
  function handleLinkClick(e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    // سكيب: روابط خارجية، anchors، javascript:، target=_blank
    if (href.startsWith('http') || href.startsWith('//')) return;
    if (href.startsWith('#')) return;
    if (href.startsWith('javascript')) return;
    if (href.startsWith('mailto') || href.startsWith('tel')) return;
    if (link.target === '_blank') return;

    // سكيب لو ctrl/cmd + click (فتح في تاب جديد)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    e.preventDefault();
    navigateTo(href);
  }

  // ══════════════════════════════════════════
  // Init
  // ══════════════════════════════════════════
  document.addEventListener('click', handleLinkClick, true);

  // Enter animation بعد كل page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEnterAnimation);
  } else {
    runEnterAnimation();
  }

  // تعطيل الـ bfcache animation issues
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('pt-exiting');
      Object.keys(CONFIG.pageTypes).forEach(function (p) {
        document.body.classList.remove(getExitClass(getTransitionType(p)));
        document.body.classList.remove(getEnterClass(getTransitionType(p)));
      });
      document.body.classList.remove('pt-exit-fade', 'pt-exit-zoom');
    }
  });

})();
