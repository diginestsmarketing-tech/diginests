/* ============================================================
   DigiNests — shared behaviour
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- header shrink on scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.count.includes('.') ? 1 : 0;
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIo.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countIo.observe(el));
  }

  /* ---------- filter bar (portfolio / blog) ---------- */
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const targetSelector = bar.dataset.target;
    const items = document.querySelectorAll(targetSelector);
    bar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  });

  /* ---------- testimonial slider ---------- */
  document.querySelectorAll('.testi-wrap').forEach(wrap => {
    const slides = wrap.querySelectorAll('.testi-slide');
    const dots = wrap.querySelectorAll('.testi-dots button');
    let idx = 0, timer;
    const show = (i) => {
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
      dots.forEach((d, n) => d.classList.toggle('active', n === i));
      idx = i;
    };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); resetTimer(); }));
    const next = () => show((idx + 1) % slides.length);
    const resetTimer = () => { clearInterval(timer); timer = setInterval(next, 6000); };
    if (slides.length) resetTimer();
  });

  /* ---------- blog modal ---------- */
  const modalOverlay = document.getElementById('blogModal');
  if (modalOverlay) {
    const modalBody = modalOverlay.querySelector('.modal');
    document.querySelectorAll('[data-article]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-article-content]') || document.querySelector(`[data-article-id="${btn.dataset.article}"]`);
        const source = document.querySelector(`#article-${btn.dataset.article}`);
        if (source) {
          modalBody.querySelector('.modal-inner').innerHTML = source.innerHTML;
        }
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    const closeModal = () => {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- contact form validation + fake submit ---------- */
  const form = document.getElementById('consultForm');
  if (form) {
    const status = form.querySelector('.form-status');
    const validators = {
      name: v => v.trim().length > 1 || 'Enter your full name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
      phone: v => v.trim() === '' || /^[0-9+\-\s()]{7,15}$/.test(v) || 'Enter a valid phone number.',
      service: v => v !== '' || 'Choose a service.',
      message: v => v.trim().length > 9 || 'Tell us a little about your goals (10+ characters).'
    };

    const validateField = (field) => {
      const name = field.name;
      if (!validators[name]) return true;
      const result = validators[name](field.value);
      const wrap = field.closest('.field');
      if (result === true) {
        wrap.classList.remove('error');
        return true;
      } else {
        wrap.classList.add('error');
        wrap.querySelector('.err-msg').textContent = result;
        return false;
      }
    };

    form.querySelectorAll('input,select,textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input,select,textarea').forEach(field => {
        if (!validateField(field)) valid = false;
      });

      status.classList.remove('show', 'ok', 'fail');

      if (!valid) {
        status.textContent = 'Please fix the highlighted fields and try again.';
        status.classList.add('show', 'fail');
        form.querySelector('.field.error input, .field.error select, .field.error textarea')?.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        status.textContent = "Thanks — your message is in. We'll reach out within one business day to confirm your free consultation.";
        status.classList.add('show', 'ok');
        form.reset();
      }, 1100);
    });
  }

  /* ---------- newsletter mini-form (footer / blog) ---------- */
  document.querySelectorAll('.newsletter-form').forEach(nf => {
    nf.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nf.querySelector('input[type="email"]');
      const msg = nf.querySelector('.nl-msg');
      if (input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        msg.textContent = "You're on the list — welcome aboard.";
        msg.style.color = 'var(--gold-400)';
        input.value = '';
      } else if (msg) {
        msg.textContent = 'Enter a valid email address.';
        msg.style.color = '#e07a6f';
      }
    });
  });

  /* ---------- active nav link ---------- */
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll(`.nav-links a[data-page="${page}"]`).forEach(a => {
      a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- ridge draw retrigger on view ---------- */
  const ridges = document.querySelectorAll('.ridge path.ridge-draw');
  if ('IntersectionObserver' in window && ridges.length) {
    const rIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'none';
          void entry.target.offsetWidth;
          entry.target.style.animation = '';
        }
      });
    }, { threshold: 0.4 });
    ridges.forEach(el => rIo.observe(el));
  }

});
