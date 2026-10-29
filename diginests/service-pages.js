/* ==========================================================================
   DigiNests — service page interactions
   Used ONLY by: seo-services-shimla, google-ads-shimla,
                 social-media-marketing-shimla, content-marketing-shimla
   Loads after script.js. Every enhancement degrades gracefully without JS.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SEO: sticky bar works as a tab switcher ---------- */
  function initTabs() {
    var bar = document.querySelector('body.svc-seo .quick-jump');
    if (!bar) return;
    var list = bar.querySelector('ul');
    var tabs = [].slice.call(bar.querySelectorAll('a[data-jump]'));
    var panels = {};
    tabs.forEach(function (a) {
      var id = a.getAttribute('data-jump');
      var p = document.getElementById(id);
      if (p) panels[id] = p;
    });
    if (!tabs.length || !Object.keys(panels).length) return;

    if (list) list.setAttribute('role', 'tablist');
    tabs.forEach(function (a) {
      var id = a.getAttribute('data-jump');
      a.setAttribute('role', 'tab');
      a.setAttribute('aria-controls', id);
      a.id = 'tab-' + id;
      if (a.parentNode && a.parentNode.tagName === 'LI') a.parentNode.setAttribute('role', 'presentation');
      if (panels[id]) {
        panels[id].setAttribute('role', 'tabpanel');
        panels[id].setAttribute('aria-labelledby', a.id);
      }
    });

    function headerOffset() {
      var h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) || 76;
      return h + bar.offsetHeight + 8;
    }

    function select(id, opts) {
      opts = opts || {};
      if (!panels[id]) return;
      tabs.forEach(function (a) {
        var on = a.getAttribute('data-jump') === id;
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        a.setAttribute('tabindex', on ? '0' : '-1');
        a.classList.toggle('active', on);
      });
      Object.keys(panels).forEach(function (k) { panels[k].classList.toggle('tab-active', k === id); });
      if (opts.scroll) {
        var rect = panels[id].getBoundingClientRect();
        var off = headerOffset();
        if (rect.top < off - 4 || rect.top > window.innerHeight * 0.5) {
          window.scrollTo({ top: rect.top + window.pageYOffset - off, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
      if (opts.hash && window.history && history.replaceState) history.replaceState(null, '', '#' + id);
    }

    tabs.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        select(a.getAttribute('data-jump'), { scroll: true, hash: true });
      });
      a.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); n.focus(); select(n.getAttribute('data-jump'), { hash: true }); }
      });
    });

    var initial = (location.hash || '').replace('#', '');
    if (panels[initial]) {
      select(initial);
      setTimeout(function () {
        var top = panels[initial].getBoundingClientRect().top + window.pageYOffset - headerOffset();
        window.scrollTo(0, top);
      }, 60);
    } else {
      select(tabs[0].getAttribute('data-jump'));
    }
    window.addEventListener('hashchange', function () {
      var id = (location.hash || '').replace('#', '');
      if (panels[id]) select(id, { scroll: true });
    });
  }

  /* ---------- SEO: interactive checklist toggles ---------- */
  function initChecklists() {
    document.querySelectorAll('.chk-grid').forEach(function (grid) {
      var prog = grid.previousElementSibling;
      var fill = prog && prog.classList.contains('chk-progress') ? prog.firstElementChild : null;
      function update() {
        if (!fill) return;
        var total = grid.querySelectorAll('.chk').length || 1;
        var done = grid.querySelectorAll('.chk[aria-pressed="true"]').length;
        fill.style.width = Math.round((done / total) * 100) + '%';
      }
      grid.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.chk') : null;
        if (!b || !grid.contains(b)) return;
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var card = b.closest('.card');
        if (card) card.classList.toggle('is-done', on);
        update();
      });
    });
  }

  /* ---------- Content: tap / keyboard support for reveal cards ---------- */
  function initFlipCards() {
    document.querySelectorAll('.flip').forEach(function (card) {
      function toggle() { card.classList.toggle('flipped'); }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        else if (e.key === 'Escape') card.classList.remove('flipped');
      });
    });
  }

  /* ---------- Social: tap-to-play reel preview ---------- */
  function initReel() {
    document.querySelectorAll('.scr-reel').forEach(function (reel) {
      reel.setAttribute('tabindex', '0');
      reel.setAttribute('role', 'button');
      reel.setAttribute('aria-pressed', 'false');
      function toggle() {
        var on = reel.classList.toggle('playing');
        reel.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      reel.addEventListener('click', toggle);
      reel.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- Content: animate the process stepper when it scrolls in ---------- */
  function initSteps() {
    var steps = document.querySelectorAll('body.svc-content .steps');
    if (!steps.length) return;
    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.25 });
    steps.forEach(function (s) { io.observe(s); });
  }

  function init() {
    initTabs();
    initChecklists();
    initFlipCards();
    initReel();
    initSteps();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
