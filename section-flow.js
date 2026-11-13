/**
 * Magnetic section navigation — no dependencies.
 * Desktop wheels require a small amount of deliberate input before advancing
 * one viewport-sized chapter. Long chapters, touchscreens, nested carousels,
 * assistive navigation and reduced-motion settings retain native scrolling.
 */
(() => {
  'use strict';
  const sections = Array.from(document.querySelectorAll('main > section[id]'));
  const rail = document.querySelector('.section-rail');
  const dots = rail ? Array.from(rail.querySelectorAll('a[href^="#"]')) : [];
  const header = document.querySelector('.site-header');
  if (sections.length < 2) return;

  const deliberateWheel = matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sectionTop = section => window.scrollY + section.getBoundingClientRect().top - (header?.getBoundingClientRect().height || 0);
  const availableHeight = () => window.innerHeight - (header?.getBoundingClientRect().height || 0);
  const nativeScrollable = element => {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      if (node.matches?.('.contact-map, dialog, [contenteditable="true"], textarea, input, select')) return true;
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 3) return true;
    }
    return false;
  };

  let activeIndex = -1;
  let frameQueued = false;
  function paintProgress() {
    frameQueued = false;
    const landmark = scrollY + (header?.getBoundingClientRect().height || 0) + availableHeight() * .4;
    let index = 0;
    for (let i = 0; i < sections.length; i++) {
      const top = scrollY + sections[i].getBoundingClientRect().top;
      if (top <= landmark) index = i;
      else break;
    }
    if (index === activeIndex) return;
    activeIndex = index;
    dots.forEach(dot => {
      const selected = dot.hash === '#' + sections[index].id;
      if (selected) dot.setAttribute('aria-current', 'location');
      else dot.removeAttribute('aria-current');
    });
  }
  const queueProgress = () => {
    if (!frameQueued) {
      frameQueued = true;
      requestAnimationFrame(paintProgress);
    }
  };
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress, { passive: true });
  queueProgress();

  // A chapter must fit reasonably well on the visible screen to receive wheel
  // interception. This avoids the classic fullpage-scroll trap on short screens.
  let accumulated = 0;
  let direction = 0;
  let lastInput = 0;
  let lockedUntil = 0;
  const resetIntent = () => { accumulated = 0; direction = 0; lastInput = 0; };
  document.addEventListener('wheel', event => {
    if (!deliberateWheel.matches || reducedMotion.matches || event.defaultPrevented || event.ctrlKey || event.metaKey) return;
    if (document.querySelector('dialog[open]') || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY) * .9) return;
    if (!(event.target instanceof Element) || nativeScrollable(event.target)) return;

    const now = performance.now();
    if (now < lockedUntil) { event.preventDefault(); return; }

    const currentY = window.scrollY;
    const topDistances = sections.map(section => Math.abs(sectionTop(section) - currentY));
    const index = topDistances.indexOf(Math.min(...topDistances));
    const current = sections[index];
    // Do not trap users inside a panel whose contents do not fit the viewport.
    if (current.getBoundingClientRect().height > availableHeight() + 26 || topDistances[index] > 42) {
      resetIntent();
      return;
    }
    const wheelDirection = Math.sign(event.deltaY);
    const target = sections[index + wheelDirection];
    if (!target) { resetIntent(); return; }

    // Intent threshold: typically two normal wheel notches or a gentle
    // trackpad gesture; cannot skip across multiple chapters in one flick.
    event.preventDefault();
    if (now - lastInput > 650 || direction !== wheelDirection) accumulated = 0;
    direction = wheelDirection;
    lastInput = now;
    const pixels = event.deltaMode === 1 ? Math.abs(event.deltaY) * 16 : event.deltaMode === 2 ? Math.abs(event.deltaY) * innerHeight : Math.abs(event.deltaY);
    accumulated += Math.min(pixels, 95);
    if (accumulated < 145) return;

    resetIntent();
    lockedUntil = now + 690;
    window.scrollTo({ top: Math.max(0, sectionTop(target)), behavior: 'smooth' });
    queueProgress();
  }, { passive: false });

  // A focused anchor is always free to use browser-native navigation.
  // After a menu/rail click, cancel any residual wheel effort from a gesture.
  document.addEventListener('click', event => {
    if (event.target.closest?.('a[href^="#"]')) resetIntent();
  });
  reducedMotion.addEventListener?.('change', resetIntent);
  deliberateWheel.addEventListener?.('change', resetIntent);
})();
