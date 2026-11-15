/* =========================================================
   Дикая природа — скрипты
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.body.classList.add('no-motion');

  /* ---------- Год в подвале ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Прогресс прокрутки + состояние шапки ---------- */
  const header = document.getElementById('header');
  const scrollBar = document.getElementById('scrollBar');
  let rafId = null;

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollBar) {
        scrollBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      if (header) header.classList.toggle('is-scrolled', y > 40);

      rafId = null;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (header) header.classList.remove('is-nav-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (header) header.classList.toggle('is-nav-open', open);
    });

    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Счётчики в блоке «в цифрах» ---------- */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const co = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              co.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => co.observe(el));
    } else {
      counters.forEach((el) => {
        el.textContent =
          Number(el.dataset.count).toLocaleString('ru-RU') + (el.dataset.suffix || '');
      });
    }
  }

  /* ---------- Легкий параллакс ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const heroMedia = document.getElementById('heroMedia');

  function parallax() {
    const vh = window.innerHeight;

    if (heroMedia && !reduceMotion) {
      const shift = Math.min(window.scrollY * 0.22, vh);
      heroMedia.style.transform = 'translate3d(0,' + shift + 'px,0)';
    }

    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
  }

  if (!reduceMotion) {
    window.addEventListener('scroll', () => requestAnimationFrame(parallax), { passive: true });
    window.addEventListener('resize', parallax);
    parallax();
  }

  /* ---------- Магнитный эффект у кнопок ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Лайтбокс ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCap');
  const lightboxClose = document.getElementById('lightboxClose');
  const cards = document.querySelectorAll('.card[data-full]');

  let lastFocused = null;

  function openLightbox(card) {
    if (!lightbox || !lightboxImg) return;
    const img = card.querySelector('img');
    const title = card.querySelector('h3');
    const tag = card.querySelector('.tag');

    lightboxImg.src = card.dataset.full;
    lightboxImg.alt = img ? img.alt : '';
    if (lightboxCap) {
      lightboxCap.textContent =
        (tag ? tag.textContent + ' — ' : '') + (title ? title.textContent : '');
    }

    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  cards.forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  /* ---------- Форма подписки ---------- */
  const form = document.querySelector('.join-form');
  const emailInput = document.getElementById('email');
  const note = document.getElementById('formNote');

  if (form && emailInput && note) {
    const defaultNote = note.textContent;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
      const field = emailInput.closest('.field');

      note.classList.remove('is-success', 'is-error');
      if (field) field.classList.remove('is-error');

      if (!valid) {
        note.textContent = 'Проверьте адрес — похоже, в нём опечатка.';
        note.classList.add('is-error');
        if (field) field.classList.add('is-error');
        emailInput.focus();
        return;
      }

      note.textContent = 'Готово! Первое письмо придёт в начале месяца.';
      note.classList.add('is-success');
      form.reset();

      window.setTimeout(() => {
        note.textContent = defaultNote;
        note.classList.remove('is-success');
      }, 6000);
    });

    emailInput.addEventListener('input', () => {
      if (note.classList.contains('is-error')) {
        note.classList.remove('is-error');
        note.textContent = defaultNote;
        const field = emailInput.closest('.field');
        if (field) field.classList.remove('is-error');
      }
    });
  }
})();
