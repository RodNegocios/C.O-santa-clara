(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const wrap = (n, length) => (n % length + length) % length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const menu = $('#mobile-nav');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('is-open');
    menu.inert = true;
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpening = toggle.getAttribute('aria-expanded') !== 'true';
      if (!isOpening) { closeMenu(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      menu.inert = false;
      menu.classList.add('is-open');
    });
    $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
  }
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Split-text reveal is driven by scroll progress, not a time-only animation.
  // Existing emphasis nodes are preserved so the semantic heading and accents remain intact.
  const textGroups = [];
  function prepareSplit(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      if (!node.nodeValue.trim()) continue;
      const frag = document.createDocumentFragment();
      for (const segment of node.nodeValue.split(/(\s+)/)) {
        if (!segment) continue;
        if (/^\s+$/.test(segment)) { frag.append(document.createTextNode(segment)); continue; }
        const span = document.createElement('span');
        span.className = 'split-word';
        span.textContent = segment;
        frag.append(span);
      }
      node.replaceWith(frag);
    }
    const words = $$('.split-word', el);
    if (words.length) textGroups.push({ el, words });
  }
  if (!reduceMotion.matches) {
    $$('[data-split]').forEach(prepareSplit);
    document.body.classList.add('js-motion');
  }
  function updateScrollEffects() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 15);
    if (reduceMotion.matches) return;
    const vh = window.innerHeight || 800;
    for (const { el, words } of textGroups) {
      const rect = el.getBoundingClientRect();
      if (rect.top > vh * 1.45 || rect.bottom < -150) continue;
      const fraction = clamp((vh * .91 - rect.top) / (vh * .48 + rect.height * .5), 0, 1);
      const length = words.length;
      for (let i = 0; i < length; i++) {
        const t = clamp((fraction - i / Math.max(length, 1) * .35) / .57, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        words[i].style.opacity = eased.toFixed(3);
        words[i].style.transform = `translate3d(0, ${(1 - eased) * 21}px, 0)`;
      }
    }
  }
  let scrollScheduled = false;
  function scheduleScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => { scrollScheduled = false; updateScrollEffects(); });
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  document.fonts?.ready.then(scheduleScroll).catch(() => {});
  scheduleScroll();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -35px 0px' }) : null;
  if (!reduceMotion.matches && observer) {
    $$('.intro-media, .professional-photo, .contact-grid, .trust-rating').forEach(el => {
      el.classList.add('image-reveal');
      observer.observe(el);
    });
  }

  // Three-dimensional looping service carousel: buttons, dots, swipe, keyboard and gentle autoplay.
  const stage = $('#service-stage');
  const cards = stage ? $$('.service-card', stage) : [];
  let serviceIndex = 0;
  let serviceTimer = 0;
  let serviceVisible = false;
  let serviceHover = false;
  function paintServices() {
    if (!stage || !cards.length) return;
    const step = Math.min(stage.clientWidth * (window.innerWidth < 701 ? .78 : .34), 390);
    cards.forEach((card, index) => {
      let distance = index - serviceIndex;
      if (distance > cards.length / 2) distance -= cards.length;
      if (distance < -cards.length / 2) distance += cards.length;
      if (cards.length % 2 === 0 && distance === cards.length / 2) distance *= -1;
      const away = Math.abs(distance);
      card.style.transform = `translate3d(calc(-50% + ${distance * step}px), ${away * 19}px, ${-away * 55}px) rotateY(${-distance * 15}deg) scale(${1 - away * .115})`;
      card.style.opacity = away >= 2 ? '0' : away === 0 ? '1' : '.58';
      card.style.filter = away === 0 ? 'none' : 'saturate(.73)';
      card.style.zIndex = String(10 - away);
      card.classList.toggle('is-active', away === 0);
      card.setAttribute('aria-hidden', away === 0 ? 'false' : 'true');
    });
    const count = $('#service-current');
    if (count) count.textContent = String(serviceIndex + 1).padStart(2, '0');
    $$('.carousel-dots button').forEach((dot, index) => dot.setAttribute('aria-current', index === serviceIndex ? 'true' : 'false'));
  }
  function setService(nextIndex) {
    serviceIndex = wrap(nextIndex, cards.length);
    paintServices();
  }
  if (stage && cards.length) {
    $('#service-prev')?.addEventListener('click', () => setService(serviceIndex - 1));
    $('#service-next')?.addEventListener('click', () => setService(serviceIndex + 1));
    $$('.carousel-dots button').forEach((dot, i) => dot.addEventListener('click', () => setService(i)));
    stage.setAttribute('tabindex', '0');
    stage.setAttribute('aria-label', 'Use as setas do teclado para explorar os cuidados');
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setService(serviceIndex + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setService(serviceIndex - 1); }
      if (e.key === 'Home') { e.preventDefault(); setService(0); }
      if (e.key === 'End') { e.preventDefault(); setService(cards.length - 1); }
    });
    let pointerStart = null;
    stage.addEventListener('pointerdown', e => { if (e.isPrimary) pointerStart = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener('pointerup', e => {
      if (!pointerStart) return;
      const dx = e.clientX - pointerStart.x;
      if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(e.clientY - pointerStart.y) * .8) setService(serviceIndex + (dx < 0 ? 1 : -1));
      pointerStart = null;
    });
    stage.addEventListener('pointercancel', () => { pointerStart = null; });
    stage.addEventListener('mouseenter', () => { serviceHover = true; });
    stage.addEventListener('mouseleave', () => { serviceHover = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { serviceVisible = entries[0].isIntersecting; }, { threshold: .35 }).observe(stage);
    } else serviceVisible = true;
    if (!reduceMotion.matches) serviceTimer = window.setInterval(() => {
      if (serviceVisible && !serviceHover && !document.hidden && !$('#lightbox')?.classList.contains('is-open')) setService(serviceIndex + 1);
    }, 5200);
    window.addEventListener('resize', paintServices, { passive: true });
    paintServices();
  }

  // Circular-gallery composition with an arced, looping track and keyboard / drag support.
  const gallery = $('#gallery');
  const galleryCards = gallery ? $$('.gallery-card', gallery) : [];
  const lightbox = $('#lightbox');
  let galleryIndex = 0;
  let lightboxIndex = -1;
  let lastFocused = null;
  let dragged = false;
  function paintGallery() {
    if (!gallery || !galleryCards.length) return;
    const step = Math.min(window.innerWidth < 701 ? gallery.clientWidth * .58 : gallery.clientWidth * .25, 370);
    galleryCards.forEach((card, i) => {
      let diff = i - galleryIndex;
      if (diff > galleryCards.length / 2) diff -= galleryCards.length;
      if (diff < -galleryCards.length / 2) diff += galleryCards.length;
      const n = Math.abs(diff);
      const scale = 1 - Math.min(n, 3) * .08;
      card.style.transform = `translate3d(calc(-50% + ${diff * step}px), ${n * n * 17}px, 0) rotate(${diff * -5}deg) scale(${scale})`;
      card.style.opacity = n > 2.5 ? '0' : n > 1.5 ? '.42' : n > .5 ? '.75' : '1';
      card.style.zIndex = String(20 - n);
      card.style.filter = n === 0 ? 'none' : 'saturate(.65)';
      card.tabIndex = n > 2.5 ? -1 : 0;
    });
    const position = $('#gallery-position');
    if (position) position.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryCards.length).padStart(2, '0')}`;
  }
  function setGallery(next) { galleryIndex = wrap(next, galleryCards.length); paintGallery(); }
  if (gallery && galleryCards.length) {
    gallery.classList.add('is-enhanced');
    $('#gallery-prev')?.addEventListener('click', () => setGallery(galleryIndex - 1));
    $('#gallery-next')?.addEventListener('click', () => setGallery(galleryIndex + 1));
    gallery.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setGallery(galleryIndex + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setGallery(galleryIndex - 1); }
      if (e.key === 'Home') { e.preventDefault(); setGallery(0); }
      if (e.key === 'End') { e.preventDefault(); setGallery(galleryCards.length - 1); }
    });
    let start = null;
    gallery.addEventListener('pointerdown', e => { if (e.isPrimary && !lightbox?.classList.contains('is-open')) { start = { x:e.clientX,y:e.clientY }; dragged = false; } });
    gallery.addEventListener('pointermove', e => { if (start && Math.abs(e.clientX - start.x) > 12) dragged = true; });
    gallery.addEventListener('pointerup', e => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y) * .8) setGallery(galleryIndex + (dx < 0 ? 1 : -1));
      start = null;
    });
    gallery.addEventListener('pointercancel', () => {start = null; dragged = false;});
    gallery.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) {
        e.preventDefault(); setGallery(galleryIndex + (e.deltaX > 0 ? 1 : -1));
      }
    }, { passive:false });
    galleryCards.forEach((card, i) => card.addEventListener('click', e => {
      if (dragged) { e.preventDefault(); dragged = false; return; }
      setGallery(i);
      openLightbox(i);
    }));
    window.addEventListener('resize', paintGallery, { passive:true });
    paintGallery();
  }
  function showLightboxImage(index) {
    lightboxIndex = wrap(index, galleryCards.length);
    const card = galleryCards[lightboxIndex];
    const source = $('img', card);
    const img = $('#lightbox-img');
    if (!source || !img) return;
    img.src = source.getAttribute('src');
    img.alt = source.alt;
    $('#lightbox-caption').textContent = card.dataset.caption || '';
    setGallery(lightboxIndex);
  }
  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showLightboxImage(index);
    lightbox.inert = false;
    lightbox.setAttribute('aria-hidden','false');
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('.lightbox-close')?.focus();
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden','true');
    lightbox.inert = true;
    document.body.style.overflow = '';
    $('#lightbox-img').removeAttribute('src');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  if (lightbox) {
    $('.lightbox-close', lightbox)?.addEventListener('click', closeLightbox);
    $('.lightbox-left', lightbox)?.addEventListener('click', () => showLightboxImage(lightboxIndex - 1));
    $('.lightbox-right', lightbox)?.addEventListener('click', () => showLightboxImage(lightboxIndex + 1));
    lightbox.addEventListener('click', e => {if (e.target === lightbox) closeLightbox();});
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') {e.preventDefault(); closeLightbox();}
      if (e.key === 'ArrowRight') {e.preventDefault(); showLightboxImage(lightboxIndex + 1);}
      if (e.key === 'ArrowLeft') {e.preventDefault(); showLightboxImage(lightboxIndex - 1);}
      if (e.key === 'Tab') {
        const focusables = $$('button:not([disabled])', lightbox);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {e.preventDefault();last.focus();}
        else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first.focus();}
      }
    });
  }
  reduceMotion.addEventListener?.('change', () => { if (reduceMotion.matches) {window.clearInterval(serviceTimer);textGroups.forEach(({words}) => words.forEach(w => {w.style.opacity = '1';w.style.transform = 'none';}));} });
})();
