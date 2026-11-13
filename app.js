(() => {
  'use strict';
  if (window.__SC_SITE_INITIALIZED__) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const wrap = (v, n) => (v % n + n) % n;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Accessible, closable mobile navigation.
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    mobileNav.classList.remove('is-open');
    mobileNav.inert = true;
  };
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      if (!opening) return closeMenu();
      mobileNav.inert = false;
      mobileNav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
    });
    $$('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
    window.addEventListener('resize', () => { if (innerWidth > 860) closeMenu(); }, {passive:true});
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  // Hero architectural construction lines can be paused independently.
  const motionToggle = $('#motion-toggle');
  const hero = $('.hero');
  if (motionToggle && hero) motionToggle.addEventListener('click', () => {
    const paused = hero.classList.toggle('motion-paused');
    motionToggle.setAttribute('aria-pressed', String(paused));
    $('#motion-label').textContent = paused ? 'Animar linhas' : 'Pausar linhas';
    $('.pause-mark', motionToggle).textContent = paused ? '▷' : 'Ⅱ';
  });

  // Word-by-word motion driven by scroll position (not merely triggered by the viewport).
  const splitGroups = [];
  function splitWords(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.className = 'split-word';
        word.textContent = part;
        frag.append(word);
      });
      node.replaceWith(frag);
    });
    const words = $$('.split-word', element);
    if (words.length) splitGroups.push({element, words});
  }
  if (!reducedMotion.matches) $$('[data-split]').forEach(splitWords);
  let waiting = false;
  function paintScrollText() {
    waiting = false;
    if (reducedMotion.matches) return;
    const viewHeight = window.innerHeight || 700;
    splitGroups.forEach(({element,words}) => {
      const box = element.getBoundingClientRect();
      if (box.top > viewHeight * 1.4 || box.bottom < -250) return;
      const progress = clamp((viewHeight * .91 - box.top) / (viewHeight * .51 + box.height * .43), 0, 1);
      words.forEach((word,index) => {
        const time = clamp((progress - index / Math.max(1,words.length) * .23) / .72,0,1);
        const ease = 1 - Math.pow(1 - time,3);
        word.style.opacity = ease.toFixed(3);
        word.style.transform = `translate3d(0,${((1 - ease) * 19).toFixed(2)}px,0)`;
      });
    });
  }
  function queueScroll() { if (waiting) return; waiting = true; requestAnimationFrame(paintScrollText); }
  addEventListener('scroll',queueScroll,{passive:true});
  addEventListener('resize',queueScroll,{passive:true});
  document.fonts?.ready.then(queueScroll).catch(() => {});
  queueScroll();

  // Three-dimensional, keyboard accessible and swipeable carousel.
  const serviceStage = $('#service-stage');
  const serviceCards = serviceStage ? $$('.service-card',serviceStage) : [];
  let serviceIndex = 0, servicesHover = false, servicesVisible = true;
  function paintServices() {
    if (!serviceStage || !serviceCards.length) return;
    const step = Math.min(serviceStage.clientWidth * (innerWidth <= 600 ? .72 : .34), 435);
    serviceCards.forEach((card, index) => {
      let diff = index - serviceIndex;
      if (diff > serviceCards.length / 2) diff -= serviceCards.length;
      if (diff < -serviceCards.length / 2) diff += serviceCards.length;
      if (serviceCards.length % 2 === 0 && diff === serviceCards.length / 2) diff *= -1;
      const distance = Math.abs(diff);
      card.style.transform = `translate3d(calc(-50% + ${diff * step}px),${distance * 17}px,${-distance * 60}px) rotateY(${-diff * 13}deg) scale(${1 - distance * .115})`;
      card.style.opacity = distance >= 2 ? '0' : distance ? '.55' : '1';
      card.style.zIndex = String(10 - distance);
      card.style.filter = distance ? 'saturate(.78)' : 'none';
      card.classList.toggle('is-active', !distance);
      card.setAttribute('aria-hidden', distance === 0 ? 'false' : 'true');
    });
    $('#service-current').textContent = String(serviceIndex + 1).padStart(2,'0');
    $$('.carousel-dots button').forEach((button,index) => button.setAttribute('aria-current',String(index === serviceIndex)));
  }
  function setService(index) { serviceIndex = wrap(index,serviceCards.length); paintServices(); }
  if (serviceStage && serviceCards.length) {
    $('#service-prev')?.addEventListener('click', () => setService(serviceIndex - 1));
    $('#service-next')?.addEventListener('click', () => setService(serviceIndex + 1));
    $$('.carousel-dots button').forEach((button,index) => button.addEventListener('click',() => setService(index)));
    serviceStage.addEventListener('keydown',event => {
      if (event.key === 'ArrowLeft') {event.preventDefault();setService(serviceIndex - 1);}
      if (event.key === 'ArrowRight') {event.preventDefault();setService(serviceIndex + 1);}
      if (event.key === 'Home') {event.preventDefault();setService(0);}
      if (event.key === 'End') {event.preventDefault();setService(serviceCards.length - 1);}
    });
    let start = null;
    serviceStage.addEventListener('pointerdown',e => { if (e.isPrimary) start = {x:e.clientX,y:e.clientY}; });
    serviceStage.addEventListener('pointerup',e => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y) * .8) setService(serviceIndex + (dx < 0 ? 1 : -1));
      start = null;
    });
    serviceStage.addEventListener('pointercancel',() => start = null);
    serviceStage.addEventListener('mouseenter',() => servicesHover = true);
    serviceStage.addEventListener('mouseleave',() => servicesHover = false);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {servicesVisible = entries[0].isIntersecting;},{threshold:.2}).observe(serviceStage);
    if (!reducedMotion.matches) setInterval(() => {
      if (servicesVisible && !servicesHover && !document.hidden && !$('#lightbox')?.classList.contains('is-open')) setService(serviceIndex + 1);
    },6000);
    addEventListener('resize',paintServices,{passive:true});
    paintServices();
  }

  // Circular results gallery: arc poses, touch drag, arrows, and accessible lightbox.
  const gallery = $('#gallery');
  const cards = gallery ? $$('.gallery-card',gallery) : [];
  const lightbox = $('#lightbox');
  let galleryIndex = 0, modalIndex = 0, lastFocus = null, dragged = false;
  function paintGallery() {
    if (!gallery || !cards.length) return;
    const step = Math.min(gallery.clientWidth * (innerWidth <= 600 ? .60 : .26),370);
    cards.forEach((card,index) => {
      let diff = index - galleryIndex;
      if (diff > cards.length / 2) diff -= cards.length;
      if (diff < -cards.length / 2) diff += cards.length;
      const distance = Math.abs(diff);
      card.style.transform = `translate3d(calc(-50% + ${diff * step}px),${distance * distance * 24}px,0) rotate(${-diff * 5.5}deg) scale(${1 - Math.min(distance,3) * .085})`;
      card.style.opacity = distance >= 3 ? '0' : distance >= 2 ? '.47' : distance ? '.78' : '1';
      card.style.zIndex = String(10 - distance);
      card.style.filter = distance ? 'saturate(.75)' : 'none';
      card.tabIndex = distance >= 3 ? -1 : 0;
    });
    $('#gallery-position').textContent = `${String(galleryIndex+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  }
  function setGallery(index) { galleryIndex = wrap(index,cards.length); paintGallery(); }
  function showModalImage(index) {
    modalIndex = wrap(index,cards.length);
    const card = cards[modalIndex];
    const source = $('img',card), target = $('#lightbox-img');
    target.src = source.getAttribute('src');
    target.alt = source.alt;
    $('#lightbox-caption').textContent = card.dataset.caption || '';
    setGallery(modalIndex);
  }
  function openModal(index) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    showModalImage(index);
    lightbox.inert = false;
    lightbox.setAttribute('aria-hidden','false');
    lightbox.classList.add('is-open');
    document.body.classList.add('modal-open');
    $('.lightbox-close',lightbox).focus();
  }
  function closeModal() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden','true');
    lightbox.inert = true;
    document.body.classList.remove('modal-open');
    $('#lightbox-img').removeAttribute('src');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  if (gallery && cards.length) {
    $('#gallery-prev')?.addEventListener('click',() => setGallery(galleryIndex - 1));
    $('#gallery-next')?.addEventListener('click',() => setGallery(galleryIndex + 1));
    gallery.addEventListener('keydown',event => {
      if (event.key === 'ArrowLeft') {event.preventDefault();setGallery(galleryIndex - 1);}
      if (event.key === 'ArrowRight') {event.preventDefault();setGallery(galleryIndex + 1);}
      if (event.key === 'Home') {event.preventDefault();setGallery(0);}
      if (event.key === 'End') {event.preventDefault();setGallery(cards.length - 1);}
    });
    let pointer = null;
    gallery.addEventListener('pointerdown',e => {if (e.isPrimary) {pointer={x:e.clientX,y:e.clientY};dragged=false;}});
    gallery.addEventListener('pointermove',e => {if (pointer && Math.abs(e.clientX - pointer.x)>12) dragged=true;});
    gallery.addEventListener('pointerup',e => {
      if (!pointer) return;
      const dx = e.clientX - pointer.x;
      if (Math.abs(dx)>40 && Math.abs(dx)>Math.abs(e.clientY-pointer.y)*.75) setGallery(galleryIndex+(dx<0?1:-1));
      pointer=null;
      if (dragged) setTimeout(() => dragged=false,120);
    });
    gallery.addEventListener('pointercancel',() => {pointer=null;dragged=false;});
    cards.forEach((card,index) => card.addEventListener('click',e => {if (dragged){e.preventDefault();return;}openModal(index);}));
    addEventListener('resize',paintGallery,{passive:true});
    paintGallery();
  }
  if (lightbox) {
    $('.lightbox-close',lightbox)?.addEventListener('click',closeModal);
    $('.lightbox-left',lightbox)?.addEventListener('click',() => showModalImage(modalIndex - 1));
    $('.lightbox-right',lightbox)?.addEventListener('click',() => showModalImage(modalIndex + 1));
    lightbox.addEventListener('click',e => {if (e.target === lightbox) closeModal();});
    document.addEventListener('keydown',e => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') {e.preventDefault();closeModal();}
      if (e.key === 'ArrowRight') {e.preventDefault();showModalImage(modalIndex+1);}
      if (e.key === 'ArrowLeft') {e.preventDefault();showModalImage(modalIndex-1);}
      if (e.key === 'Tab') {
        const focusables = $$('button:not([disabled])',lightbox);
        const first=focusables[0],last=focusables[focusables.length-1];
        if (e.shiftKey && document.activeElement===first) {e.preventDefault();last.focus();}
        else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first.focus();}
      }
    });
  }
  reducedMotion.addEventListener?.('change',() => {
    if (reducedMotion.matches) splitGroups.forEach(({words}) => words.forEach(word => {word.style.opacity='1';word.style.transform='none';}));
    else queueScroll();
  });
  window.__SC_SITE_INITIALIZED__ = true;
  document.documentElement.classList.add('js-enabled');
})();
