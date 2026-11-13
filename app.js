(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smooth = () => reducedMotion.matches ? 'auto' : 'smooth';
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Accessible mobile navigation. The desktop links are always plain anchors.
  const menuToggle = $('.menu-toggle');
  const menu = $('#navegacao');
  function closeMenu() {
    if (!menuToggle || !menu) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  }
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 850) closeMenu();
    }, { passive: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }
  document.documentElement.classList.add('js-enabled');

  // Native scroll-snap carousel. All images and cards remain visible without JS.
  function carousel({ track, prev, next, item, counter, progress, centered = false }) {
    const scroller = $(track);
    if (!scroller) return;
    const cards = $$(item, scroller);
    const previous = $(prev), following = $(next);
    if (!cards.length) return;
    let current = 0;
    let scheduled = false;
    const getIndex = () => {
      const center = scroller.getBoundingClientRect();
      const target = centered ? center.left + center.width / 2 : center.left + 4;
      let bestIndex = 0, bestDistance = Infinity;
      cards.forEach((card, index) => {
        const box = card.getBoundingClientRect();
        const point = centered ? box.left + box.width / 2 : box.left;
        const distance = Math.abs(point - target);
        if (distance < bestDistance) { bestIndex = index; bestDistance = distance; }
      });
      return bestIndex;
    };
    function update() {
      scheduled = false;
      current = getIndex();
      if (counter) $(counter).textContent = String(current + 1).padStart(2, '0');
      if (progress) $(progress).style.width = `${(current + 1) / cards.length * 100}%`;
      if (previous) previous.disabled = current === 0;
      if (following) following.disabled = current === cards.length - 1;
    }
    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };
    function go(index) {
      const target = cards[Math.max(0, Math.min(cards.length - 1, index))];
      if (!target) return;
      const trackBox = scroller.getBoundingClientRect();
      const cardBox = target.getBoundingClientRect();
      const alignment = centered ? (trackBox.width - cardBox.width) / 2 : 0;
      const left = scroller.scrollLeft + cardBox.left - trackBox.left - alignment;
      scroller.scrollTo({ left, behavior: smooth() });
      current = cards.indexOf(target);
      requestUpdate();
    }
    previous?.addEventListener('click', () => go(current - 1));
    following?.addEventListener('click', () => go(current + 1));
    scroller.addEventListener('scroll', requestUpdate, { passive: true });
    scroller.addEventListener('keydown', event => {
      if (event.target !== scroller) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); }
      if (event.key === 'Home') { event.preventDefault(); go(0); }
      if (event.key === 'End') { event.preventDefault(); go(cards.length - 1); }
    });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
    return { go, size: cards.length };
  }
  carousel({ track: '#services-track', prev: '#services-prev', next: '#services-next', item: '.service-card', counter: '#service-number', progress: '#service-progress' });
  const galleryCarousel = carousel({ track: '#gallery-track', prev: '#gallery-prev', next: '#gallery-next', item: '.gallery-item', centered: true });

  // Native dialog provides focus management and Escape-to-close.
  const lightbox = $('#lightbox');
  const links = $$('.gallery-item');
  let activeImage = 0;
  let opener = null;
  function showImage(index) {
    if (!links.length) return;
    activeImage = (index + links.length) % links.length;
    const link = links[activeImage];
    const image = $('#lightbox-img');
    image.src = link.getAttribute('href');
    image.alt = $('img', link)?.alt || 'Registro de resultado';
    $('#lightbox-title').textContent = link.dataset.title || 'Registro da clínica';
  }
  function closeLightbox() {
    if (lightbox?.open) lightbox.close();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }
  if (lightbox && typeof lightbox.showModal === 'function') {
    links.forEach((link, index) => link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      showImage(index);
      lightbox.showModal();
    }));
    $('#lightbox-close')?.addEventListener('click', closeLightbox);
    $('#lightbox-prev')?.addEventListener('click', () => showImage(activeImage - 1));
    $('#lightbox-next')?.addEventListener('click', () => showImage(activeImage + 1));
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeImage - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeImage + 1); }
    });
    lightbox.addEventListener('close', () => {
      const img = $('#lightbox-img');
      if (img) img.removeAttribute('src');
    });
  }

  // If one hero photograph is unavailable, try the other supplied photograph.
  // If no photo is available, do not display a broken-image icon.
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback;
      if (fallback && !img.dataset.triedFallback) {
        img.dataset.triedFallback = 'true';
        img.src = fallback;
        return;
      }
      img.classList.add('is-missing');
      img.setAttribute('aria-label', 'Imagem indisponível');
    });
  });

  // Gentle progressive reveals; text and cards never start hidden.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { target.classList.add('in-view'); io.unobserve(target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    $$('.section-heading, .hero-lead, .editorial-side, .professional-copy, .contact-intro').forEach(element => observer.observe(element));
  }
  void galleryCarousel;
})();
