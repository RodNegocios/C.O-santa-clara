/**
 * AnimatedContent — progressive animation behavior from the supplied React Bits API.
 * Native Web Animations + IntersectionObserver; static content is always visible as fallback.
 */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...document.querySelectorAll('[data-animate]')];
  if (!nodes.length || reduced.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const clamp = (n, lo, hi) => Math.min(hi,Math.max(lo,n));
  const number = (el, key, fallback) => Number.isFinite(Number(el.dataset[key])) ? Number(el.dataset[key]) : fallback;
  const easing = { 'power3.out':'cubic-bezier(.22,1,.36,1)', 'expo.out':'cubic-bezier(.16,1,.3,1)', 'back.out':'cubic-bezier(.19,1.22,.36,1)' };
  function directionValue(el) {
    const horizontal = el.dataset.direction === 'horizontal';
    const sign = el.dataset.reverse === 'true' ? -1 : 1;
    const distance = clamp(number(el,'distance',58),0,160)*sign;
    return horizontal ? [distance,0] : [0,distance];
  }
  function transform(x,y,scale,tilt){
    return `translate3d(${x}px,${y}px,0) scale(${scale}) rotateX(${tilt}deg)`;
  }
  function indices(count, mode) {
    return Array.from({length:count},(_,i)=>i).sort((a,b)=>{
      if(mode==='end')return b-a;
      if(mode==='center')return Math.abs(a-(count-1)/2)-Math.abs(b-(count-1)/2);
      if(mode==='edges')return Math.min(a,count-1-a)-Math.min(b,count-1-b);
      return a-b;
    });
  }
  function play(el) {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated='true';
    const group=el.hasAttribute('data-stagger');
    const children=group?[...el.children].filter(child=>!child.matches('script,style')):[el];
    const order=indices(children.length,el.dataset.staggerFrom||'start');
    const gap=clamp(number(el,'stagger',0),0,.5)*1000;
    const duration=clamp(number(el,'duration',.86),.2,2)*1000;
    const delay=clamp(number(el,'delay',0),0,2)*1000;
    const blur=clamp(number(el,'blur',0),0,16);
    const scale=clamp(number(el,'scale',.985),.8,1.1);
    const tilt=clamp(number(el,'tilt',0),-20,20);
    const [x,y]=directionValue(el);
    const options={duration,fill:'both',easing:easing[el.dataset.ease]||'cubic-bezier(.22,1,.36,1)'};
    children.forEach((child,i)=>{
      const wipe=el.dataset.wipe||'none';
      const from={opacity:clamp(number(el,'initialOpacity',.1),0,1),transform:transform(x,y,scale,tilt),filter:blur?`blur(${blur}px)`:'blur(0px)'};
      const to={opacity:1,transform:transform(0,0,1,0),filter:'blur(0px)'};
      if(wipe==='up'){from.clipPath='inset(100% 0 0 0)';to.clipPath='inset(0 0 0 0)';}
      if(wipe==='left'){from.clipPath='inset(0 100% 0 0)';to.clipPath='inset(0 0 0 0)';}
      if(wipe==='right'){from.clipPath='inset(0 0 0 100%)';to.clipPath='inset(0 0 0 0)';}
      const animation=child.animate([from,to],{...options,delay:delay+order.indexOf(i)*gap});
      animation.addEventListener('finish',()=>animation.cancel(),{once:true});
      // Do not leave any content invisible on animation cancellation or a tab freeze.
      animation.addEventListener('cancel',()=>{child.style.opacity='';child.style.transform='';child.style.filter='';child.style.clipPath='';},{once:true});
    });
  }
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      play(entry.target);
      observer.unobserve(entry.target);
    });
  },{threshold:.11,rootMargin:'0px 0px -22px 0px'});
  nodes.forEach(el => {
    if(el.dataset.trigger==='mount') play(el);
    else observer.observe(el);
  });
  reduced.addEventListener?.('change',()=>{
    if(!reduced.matches)return;
    observer.disconnect();
    document.getAnimations().forEach(animation=>animation.cancel());
  });
})();
