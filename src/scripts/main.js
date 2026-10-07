import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import marqueeLogos from './marquee-logos.json';

gsap.registerPlugin(ScrollTrigger, SplitText);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({
  duration: 0.78,
  wheelMultiplier: 0.98,
  smoothWheel: !reducedMotion,
  smoothTouch: false,
  anchors: true,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const nav = document.querySelector('.g_nav_wrap');
const menu = document.getElementById('fullNavTile');
const toggle = document.querySelector('[data-navigation-toggle]');
function setMenu(open) {
  document.body.classList.toggle('nav-active', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  if (menu) menu.inert = !open;
  if (open) {lenis.stop();menu?.querySelector('a')?.focus({preventScroll:true});}
  else {lenis.start();}
}
toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-active')));
document.addEventListener('keydown', e => {
  if (!document.body.classList.contains('nav-active')) return;
  if (e.key === 'Escape') {setMenu(false);toggle?.focus();}
  if (e.key === 'Tab') {
    const items = [toggle, ...menu.querySelectorAll('a[href]')].filter(Boolean);
    const index = items.indexOf(document.activeElement);
    e.preventDefault(); items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
  }
});
menu?.querySelectorAll('a').forEach(a => {
  if (new URL(a.href).pathname.replace(/\/$/,'') === location.pathname.replace(/\/$/,'')) a.setAttribute('aria-current','page');
});

let lastY = scrollY;
let upwardNavTravel = 0;
function updateNav(y) {
  const heroWrapper = document.querySelector('.hero_scroll_pin_wrap');
  const innerHero = document.querySelector('.inner_hero_section');
  const threshold = heroWrapper ? (heroWrapper.offsetHeight - 120) : (innerHero ? (innerHero.offsetHeight - 110) : 300);
  const inHeroSequence = heroWrapper && y < (heroWrapper.offsetHeight - 120);

  nav?.classList.toggle('is-scrolled', y > threshold);
  const delta = y - lastY;
  if (inHeroSequence || y <= 100 || document.body.classList.contains('nav-active')) {
    nav?.classList.remove('is-hidden');
    upwardNavTravel = 0;
  } else if (delta > 1) {
    upwardNavTravel = 0;
    nav?.classList.add('is-hidden');
  } else if (delta < -1) {
    upwardNavTravel += -delta;
    if (upwardNavTravel >= 16) nav?.classList.remove('is-hidden');
  } else {
    // Keep the current state when scrolling settles.
  }
  lastY = y;
}
lenis.on('scroll', ({animatedScroll}) => updateNav(animatedScroll));

// -------------------------------------------------------------
// Unified Asset Preload & High-Definition Gating Engine
// -------------------------------------------------------------
const loader = document.getElementById('sitePreloader');
const loaderBar = loader?.querySelector('[data-preloader-bar]');
const loaderCounter = loader?.querySelector('[data-preloader-count]');
let exiting = false;

function setPreloadProgress(ratio) {
  const clamped = Math.min(1, Math.max(0, ratio));
  if (loaderBar) {
    loaderBar.style.transform = `scaleX(${clamped})`;
  }
  if (loaderCounter) {
    loaderCounter.textContent = `${Math.round(clamped * 100)}%`;
  }
}

function dismissLoader() {
  if (!loader || exiting) return;
  exiting = true;
  setPreloadProgress(1);
  gsap.to(loader, {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
    duration: reducedMotion ? 0 : 0.75,
    ease: 'power3.inOut',
    onComplete: () => {
      loader.style.display = 'none';
      loader.classList.add('is-loaded');
      ScrollTrigger.refresh();
    }
  });
  if (!reducedMotion) {
    const titles = document.querySelectorAll('.hero_main_text_heading');
    if (titles.length) gsap.fromTo(titles, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power3.out' });
  }
}

// Cover the old page before navigating, then reveal the destination with the same curtain.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
  const url = new URL(a.href);
  if (url.origin !== location.origin) return;
  if (url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) {
    if (document.body.classList.contains('nav-active')) setMenu(false);
    if (!url.hash) { e.preventDefault(); lenis.scrollTo(0); }
    return;
  }
  if (!loader || reducedMotion) return;
  e.preventDefault();
  loader.classList.remove('is-loaded');
  loader.classList.add('is-leaving');
  loader.style.display = 'flex';
  gsap.killTweensOf(loader);
  gsap.fromTo(loader, { clipPath: 'polygon(0% 100%,100% 100%,100% 100%,0% 100%)' }, {
    clipPath: 'polygon(0% 0%,100% 0%,100% 0%,0% 0%)',
    duration: 0.45,
    ease: 'power3.inOut',
    onComplete: () => location.assign(url.href)
  });
});

window.addEventListener('pageshow', e => {
  if (e.persisted) {
    gsap.killTweensOf(loader);
    if (loader) {
      loader.style.display = 'none';
      loader.classList.remove('is-leaving');
    }
    setMenu(false);
    ScrollTrigger.refresh();
  }
});

// -------------------------------------------------------------
// High-Performance 121-Frame Canvas Sequence Scrubber (Rio Property Engine)
// -------------------------------------------------------------
const canvas = document.getElementById('heroSequenceCanvas');
const heroCamera = document.getElementById('heroCameraImage');

let totalTasks = 0;
let completedTasks = 0;

function reportTaskDone() {
  completedTasks++;
  if (totalTasks > 0) {
    setPreloadProgress(completedTasks / totalTasks);
  }
}

function preloadDomImage(img) {
  return new Promise(resolve => {
    const done = () => {
      reportTaskDone();
      resolve();
    };
    if (img.complete && img.naturalWidth > 0) {
      if ('decode' in img) {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
      return;
    }
    const temp = new Image();
    temp.src = img.currentSrc || img.src;
    temp.onload = () => {
      if ('decode' in temp) {
        temp.decode().then(done).catch(done);
      } else {
        done();
      }
    };
    temp.onerror = done;
  });
}

let startFramesPreload = () => Promise.resolve();

if (canvas && !reducedMotion) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const totalFrames = parseInt(canvas.dataset.frames, 10) || 121;
  const framePath = canvas.dataset.framePath || '/assets/frames/frame-';
  const frameCache = new Map();
  const loadingSet = new Set();
  let currentRenderedIndex = -1;
  let targetProgress = 0;
  let currentProgress = 0;
  let isLerping = false;

  function resizeCanvas() {
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 1.5);
    const parent = canvas.parentElement || document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    canvas.width = isMobile ? Math.min(1080, Math.round(w * dpr)) : Math.min(2560, Math.round(w * dpr));
    canvas.height = isMobile ? Math.min(1920, Math.round(h * dpr)) : Math.min(1440, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (currentRenderedIndex > 0 && frameCache.has(currentRenderedIndex)) {
      drawCover(frameCache.get(currentRenderedIndex));
    }
  }

  function drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const ratio = Math.max(cw / iw, ch / ih);
    const nw = iw * ratio;
    const nh = ih * ratio;
    const cx = (cw - nw) * 0.5;
    const cy = (ch - nh) * 0.5;
    ctx.drawImage(img, cx, cy, nw, nh);
  }

  function getFrameUrl(idx) {
    return `${framePath}${idx}.webp`;
  }

  const MAX_CONCURRENT = 16;
  let activeDownloads = 0;
  const frameQueue = [];
  let onAllFramesReady = null;

  function loadSingleFrame(idx, onReady) {
    if (frameCache.has(idx)) {
      if (onReady) onReady(frameCache.get(idx));
      return;
    }
    if (loadingSet.has(idx) || idx < 1 || idx > totalFrames) return;
    loadingSet.add(idx);
    activeDownloads++;

    const img = new Image();
    img.src = getFrameUrl(idx);

    const onComplete = () => {
      loadingSet.delete(idx);
      activeDownloads--;
      reportTaskDone();
      pumpQueue();
      if (onReady) onReady(img);
      if (frameCache.size >= totalFrames && onAllFramesReady) {
        onAllFramesReady();
      }
    };

    img.onload = () => {
      if ('decode' in img) {
        img.decode().then(() => {
          frameCache.set(idx, img);
          onComplete();
        }).catch(() => {
          frameCache.set(idx, img);
          onComplete();
        });
      } else {
        frameCache.set(idx, img);
        onComplete();
      }
    };

    img.onerror = () => {
      onComplete();
    };
  }

  function pumpQueue() {
    while (activeDownloads < MAX_CONCURRENT && frameQueue.length > 0) {
      const nextIdx = frameQueue.shift();
      if (!frameCache.has(nextIdx) && !loadingSet.has(nextIdx)) {
        loadSingleFrame(nextIdx);
      }
    }
  }

  function renderFrameAtProgress(p) {
    const rawIndex = 1 + p * (totalFrames - 1);
    const targetIdx = Math.min(totalFrames, Math.max(1, Math.round(rawIndex)));
    if (targetIdx === currentRenderedIndex && frameCache.has(targetIdx)) return;

    if (frameCache.has(targetIdx)) {
      currentRenderedIndex = targetIdx;
      drawCover(frameCache.get(targetIdx));
      return;
    }

    // Nearest cached neighbor search
    let bestNeighbor = null;
    for (let offset = 1; offset <= 20; offset++) {
      if (frameCache.has(targetIdx - offset)) {
        bestNeighbor = frameCache.get(targetIdx - offset);
        break;
      }
      if (frameCache.has(targetIdx + offset)) {
        bestNeighbor = frameCache.get(targetIdx + offset);
        break;
      }
    }

    if (bestNeighbor) {
      drawCover(bestNeighbor);
    }

    loadSingleFrame(targetIdx, (img) => {
      const currentTarget = Math.min(totalFrames, Math.max(1, Math.round(1 + currentProgress * (totalFrames - 1))));
      if (Math.abs(currentTarget - targetIdx) <= 1) {
        currentRenderedIndex = targetIdx;
        drawCover(img);
      }
    });
  }

  function lerpLoop() {
    const delta = targetProgress - currentProgress;
    if (Math.abs(delta) > 0.0003) {
      currentProgress += delta * 0.22;
      renderFrameAtProgress(currentProgress);
      requestAnimationFrame(lerpLoop);
    } else {
      currentProgress = targetProgress;
      renderFrameAtProgress(currentProgress);
      isLerping = false;
    }
  }

  function requestProgress(p) {
    targetProgress = Math.min(1, Math.max(0, p));
    if (!isLerping) {
      isLerping = true;
      requestAnimationFrame(lerpLoop);
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    ScrollTrigger.refresh();
  });
  resizeCanvas();

  // Preload Orchestration: Frame 1 immediately, then keyframes, then all remaining
  startFramesPreload = () => {
    return new Promise((resolve) => {
      onAllFramesReady = resolve;

      // Prioritize Frame 1 first to draw canvas immediately
      loadSingleFrame(1, (firstFrame) => {
        resizeCanvas();
        drawCover(firstFrame);
        currentRenderedIndex = 1;
        if (heroCamera) heroCamera.style.opacity = '0';
      });

      // Keyframes across timeline spaced by 5 frames
      const keyframes = [];
      for (let k = 5; k <= totalFrames; k += 5) {
        keyframes.push(k);
      }
      if (!keyframes.includes(totalFrames)) keyframes.push(totalFrames);

      // Remaining frames
      const remaining = [];
      for (let i = 2; i <= totalFrames; i++) {
        if (!keyframes.includes(i)) remaining.push(i);
      }

      frameQueue.push(...keyframes, ...remaining);
      pumpQueue();

      // Soft safety threshold: if at least 85 frames are loaded after 18s, resolve to prevent infinite freeze
      const softTimer = setTimeout(() => {
        if (frameCache.size >= Math.min(totalFrames, 85)) {
          resolve();
        }
      }, 18000);

      // Hard safety threshold
      const hardTimer = setTimeout(() => {
        resolve();
      }, 25000);

      const origResolve = onAllFramesReady;
      onAllFramesReady = () => {
        clearTimeout(softTimer);
        clearTimeout(hardTimer);
        origResolve();
      };
    });
  };

  // ScrollTrigger timeline: pure sticky pinned, scrubbing progress seamlessly
  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#heroScrollPin',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        requestProgress(self.progress);
      },
    },
  });

  const headingAydins = document.querySelector('[data-hero-heading="aydins"]');
  const headingRealty = document.querySelector('[data-hero-heading="realty"]');
  const headingKnows = document.querySelector('[data-hero-heading="knows"]');
  const headingKerala = document.querySelector('[data-hero-heading="kerala"]');
  const paraLeft = document.querySelector('[data-hero-text="p-left"]');
  const paraRight = document.querySelector('[data-hero-text="p-right"]');
  const scrollIndicator = document.querySelector('.hero_scroll_indicator');

  if (headingAydins) heroTimeline.to(headingAydins, { xPercent: -175, ease: 'none' }, 0);
  if (headingRealty) heroTimeline.to(headingRealty, { xPercent: -125, ease: 'none' }, 0);
  if (headingKnows) heroTimeline.to(headingKnows, { xPercent: 150, ease: 'none' }, 0);
  if (headingKerala) heroTimeline.to(headingKerala, { xPercent: 125, ease: 'none' }, 0);
  if (paraLeft) heroTimeline.to(paraLeft, { xPercent: -125, opacity: 0, ease: 'none' }, 0);
  if (paraRight) heroTimeline.to(paraRight, { xPercent: 180, opacity: 0, ease: 'none' }, 0);
  if (scrollIndicator) heroTimeline.to(scrollIndicator, { opacity: 0, ease: 'none', duration: 0.2 }, 0);
} else if (heroCamera && !reducedMotion) {
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: '#heroScrollPin', start: 'top top', end: 'bottom bottom', scrub: true },
  });
  timeline.to(heroCamera, { scale: 1.16, transformOrigin: '60% 48%', ease: 'none' }, 0)
    .to('.hero_content_wrap', { y: -110, opacity: 0, ease: 'none', duration: 0.35 }, 0);
}

// -------------------------------------------------------------
// Preloader Orchestration
// -------------------------------------------------------------
async function initLoader() {
  if (!loader) return;
  const logoEl = loader.querySelector('[data-preloader-logo]');
  if (logoEl && !reducedMotion) {
    gsap.fromTo(logoEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }

  const domImages = Array.from(document.querySelectorAll('img:not([data-preloader-logo])'));
  const hasCanvas = canvas && !reducedMotion;
  const totalFrames = hasCanvas ? (parseInt(canvas.dataset.frames, 10) || 121) : 0;

  totalTasks = domImages.length + totalFrames;
  completedTasks = 0;
  setPreloadProgress(0);

  const domImagesPromise = Promise.all(domImages.map(preloadDomImage));
  const framesPromise = hasCanvas ? startFramesPreload() : Promise.resolve();

  await Promise.race([
    Promise.all([document.fonts.ready, domImagesPromise, framesPromise]),
    new Promise(r => setTimeout(r, 25000))
  ]);

  setPreloadProgress(1);
  await new Promise(r => setTimeout(r, reducedMotion ? 0 : 220));
  dismissLoader();
}

initLoader();

if(!reducedMotion) {
  gsap.utils.toArray('.u-heading-h2,.u-heading-h1').forEach(el=>{
    gsap.from(el,{scrollTrigger:{trigger:el,start:'top 92%',once:true},y:24,opacity:0,duration:.7,ease:'power2.out'});
  });
}
if(reducedMotion) {
  document.querySelectorAll('.laws_home_grid_component_border').forEach(el=>gsap.set(el, {scaleX: 1}));
}
for (const id of ['marqueeTrack1','marqueeTrack2']) {
 const track=document.getElementById(id);
 if(track) track.innerHTML=marqueeLogos.map(svg=>`<div class="marquee-item">${svg}</div>`).join('');
}
const slider=document.getElementById('featuredSlider');
if(slider) {
 let down=false,start=0,left=0,dragged=false;
 slider.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;dragged=false;start=e.clientX;left=slider.scrollLeft;});
 slider.addEventListener('pointermove',e=>{if(!down)return;const delta=e.clientX-start;if(Math.abs(delta)>5){dragged=true;slider.scrollLeft=left-delta;}});
 window.addEventListener('pointerup',()=>{down=false;});
 slider.addEventListener('dragstart',e=>e.preventDefault());
 slider.addEventListener('click',e=>{if(dragged){e.preventDefault();dragged=false;}},true);
}

const work=document.querySelector('[data-work-group]');
if(work) {
 const buttons=[...work.querySelectorAll('[data-work-button]')];
 function setView(view) {
  work.setAttribute('data-work-state',view);
  buttons.forEach(b=>{const active=b.dataset.workButton===view;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
  document.getElementById('galleryView').style.display=view==='gallery'?'block':'none';
  document.getElementById('listView').style.display=view==='list'?'block':'none';
  ScrollTrigger.refresh();
 }
 buttons.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setView(b.dataset.workButton);}));
 const items=[...work.querySelectorAll('[data-list-link]')];
 function activate(item) {
  items.forEach(i=>i.classList.toggle('is-active',i===item));
  work.querySelectorAll('[data-list-project-wrap]').forEach(card=>card.classList.toggle('is-active',card.dataset.listProjectWrap===item.dataset.listLink));
 }
 items.forEach(item=>{
  item.addEventListener('mouseenter',()=>activate(item));
  item.addEventListener('focusin',()=>activate(item));
  item.addEventListener('click',e=>{e.preventDefault();activate(item);});
 });
 if(items[0])activate(items[0]);
 setView('gallery');
}
const serviceAccordionItems = [...document.querySelectorAll('.accordion_services_item')];
const setServiceAccordion = (item, open = true) => {
 serviceAccordionItems.forEach(other => {
  const active = other === item && open;
  other.classList.toggle('is-active', active);
  other.querySelector('.accordion_services_item_inner')?.setAttribute('aria-expanded', String(active));
 });
};
serviceAccordionItems.forEach((item,index)=>{
 const button=item.querySelector('.accordion_services_item_inner');
 const panel=item.querySelector('.accordion_col_content');
 if(!button)return;
 button.setAttribute('aria-expanded',String(item.classList.contains('is-active')));
 if(panel){panel.id=`service-panel-${index}`;button.setAttribute('aria-controls',panel.id);}
 button.addEventListener('click',()=>{
  setServiceAccordion(item, !item.classList.contains('is-active'));
 });
 if (item.closest('.home-capabilities-section') && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  item.addEventListener('mouseenter', () => setServiceAccordion(item));
 }
});
// This static project has no mail API. Prepare an email without claiming delivery.
document.querySelectorAll('.reference-form').forEach(form=>{
 form.addEventListener('submit',e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nInterest: ${data.get('interest')}\nAcross: ${data.getAll('sector').join(', ')}\n\n${data.get('message')}`;
  const url=`mailto:hello@aydinsrealty.com?subject=${encodeURIComponent('Property enquiry — '+data.get('name'))}&body=${encodeURIComponent(body)}`;
  const status=form.querySelector('[role=status]');status.hidden=false;
  status.textContent='Your email draft is ready. Please send it in your email app to complete your enquiry. ';
  const link=document.createElement('a');link.href=url;link.textContent='Open email draft ↗';status.append(link);
  location.href=url;
 });
});
// Presentation-Vibe Project Detail Shrink-Scale Hero Image
document.querySelectorAll('[data-project-shrink-hero]').forEach(section => {
  const imageCanvas = section.querySelector('.project_hero_image_canvas');
  const overlayContent = section.querySelector('.project_hero_overlay_content');
  if (!imageCanvas || reducedMotion || matchMedia('(max-width:767px)').matches) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    }
  });

  tl.to(imageCanvas, {
    scale: 0.90,
    ease: 'power1.out',
  }, 0);

  if (overlayContent) {
    tl.to(overlayContent, {
      opacity: 0,
      y: -50,
      ease: 'power1.out',
    }, 0.4);
  }
});
// -------------------------------------------------------------
// Architectural Fullscreen Collage Lightbox Modal
// -------------------------------------------------------------
const aydinLightbox = document.getElementById('aydin-lightbox');
if (aydinLightbox) {
  const collageItems = Array.from(document.querySelectorAll('.aydin_collage_item'));
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxBadge = document.getElementById('lightbox-badge');
  const lightboxCaption = document.getElementById('lightbox-caption');
  let currentIndex = 0;

  function updateLightbox(index) {
    if (index < 0) index = collageItems.length - 1;
    if (index >= collageItems.length) index = 0;
    currentIndex = index;

    const item = collageItems[currentIndex];
    if (!item) return;

    const img = item.querySelector('img');
    if (img && lightboxImg) {
      const highResSource = item.querySelector('source[srcset]');
      if (highResSource) {
        const srcsetList = highResSource.srcset.split(',').map(s => s.trim().split(' ')[0]);
        lightboxImg.src = srcsetList[0] || img.currentSrc || img.src;
      } else {
        lightboxImg.src = img.currentSrc || img.src;
      }
      lightboxImg.alt = img.alt || 'Architectural Perspective';
    }

    const badge = item.querySelector('.apple_tag_badge, .editorial_tag_badge');
    if (badge && lightboxBadge) {
      lightboxBadge.textContent = badge.textContent;
    }

    const caption = item.querySelector('.apple_tag_title, .editorial_tag_title');
    if (caption && lightboxCaption) {
      lightboxCaption.textContent = caption.textContent;
    }
  }

  function openLightbox(index) {
    updateLightbox(index);
    aydinLightbox.classList.add('is-open');
    aydinLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    aydinLightbox.classList.remove('is-open');
    aydinLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  collageItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  aydinLightbox.querySelectorAll('[data-lightbox-close]').forEach(btn => {
    btn.addEventListener('click', closeLightbox);
  });

  const prevBtn = aydinLightbox.querySelector('[data-lightbox-prev]');
  const nextBtn = aydinLightbox.querySelector('[data-lightbox-next]');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentIndex + 1);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!aydinLightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') updateLightbox(currentIndex + 1);
  });
}// -------------------------------------------------------------
// Rio Property Signature Transitions & Parallax Architecture
// -------------------------------------------------------------
if (!reducedMotion) {
  // 1. Rio Property Personas Staggered Parallax Cards:
  // Cards enter at staggered heights, glide dynamically into perfect level alignment at center, and stagger exit.
  if (matchMedia('(min-width: 992px)').matches) {
    document.querySelectorAll('[data-personas-section]').forEach(section => {
      const cards = section.querySelectorAll('[data-persona]');
      if (!cards.length) return;

      // Phase 1: Staggered entry into level alignment at center-screen
      const tlIn = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'center center',
          scrub: 1,
        }
      });
      cards.forEach((card, idx) => {
        tlIn.from(card, { yPercent: 10 * (idx + 1), ease: 'none' }, 0);
      });

      // Phase 2: Staggered exit as user continues scrolling past center
      const tlOut = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'center center',
          end: 'bottom top',
          scrub: 1,
        }
      });
      cards.forEach((card, idx) => {
        tlOut.to(card, { yPercent: -10 * (idx + 1), ease: 'none' }, 0);
      });
    });
  }



  // 3. Give the editorial index a reversible, scroll-driven entrance.
  document.querySelectorAll('.laws_home_grid_item').forEach((item, index) => {
    const component = item.querySelector('.laws_home_grid_component');
    const border = item.querySelector('.laws_home_grid_component_border');
    if (!component || !border) return;

    const number = document.createElement('span');
    number.className = 'law-motion-number';
    number.setAttribute('aria-hidden', 'true');
    const numberText = document.createElement('span');
    numberText.textContent = String(index + 1).padStart(2, '0');
    number.appendChild(numberText);
    component.prepend(number);
    component.classList.add('has-law-motion');

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'top 96%',
        end: 'top 43%',
        scrub: 0.45,
        invalidateOnRefresh: true,
      },
    });
    reveal
      .fromTo(component, { x: index % 2 ? 64 : -64, opacity: 0.62 }, { x: 0, opacity: 1, duration: 1, ease: 'none' }, 0)
      .fromTo(numberText, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'none' }, 0.08)
      .fromTo(border, { scaleX: 0 }, { scaleX: 1, transformOrigin: index % 2 ? 'right' : 'left', duration: 0.8, ease: 'none' }, 0.16);
  });

  // 5. Project metrics: count measurable values; reveal dates and descriptions intact.
  document.querySelectorAll('.project_kpi_card').forEach((card, idx) => {
    const number = card.querySelector('.project_kpi_number');
    if (!number) return;
    const original = number.textContent.trim();
    const countable = original.match(/^(\d+)(%|\s+Yrs)$/i);
    number.setAttribute('aria-label', original);

    const reveal = gsap.timeline({
      delay: idx * 0.09,
      scrollTrigger: { trigger: card, start: 'top 92%', once: true },
    });
    reveal
      .from(card, { y: 28, opacity: 0, duration: 0.75, ease: 'power3.out' }, 0)
      .from(number, { y: 12, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0.1);

    if (countable) {
      const target = Number(countable[1]);
      const suffix = countable[2];
      const counter = { value: 0 };
      reveal.to(counter, {
        value: target,
        duration: 1.35,
        ease: 'power2.out',
        onUpdate: () => { number.textContent = `${Math.round(counter.value)}${suffix}`; },
        onComplete: () => { number.textContent = original; },
      }, 0.1);
    }
  });

  // 5. Rio Scrub-scale for luxury imagery
  document.querySelectorAll('[data-anim-scroll="scrub-scale"]').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;
    const isFullImage = wrap.classList.contains('full-image_layout');
    const initialScale = wrap.closest('.page-project-collage-refined') ? 1.025 : 1.15;
    gsap.fromTo(img,
      { scale: initialScale, ...(isFullImage ? { yPercent: 5, xPercent: -4, rotation: .6, transformOrigin: '54% 72%' } : {}) },
      { 
        scale: isFullImage ? 1.9 : 1.0,
        ...(isFullImage ? { yPercent: -9, xPercent: 6, rotation: -.8 } : {}),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          // Let the featured image keep zooming for its entire visible scroll pass.
          end: 'bottom top',
          scrub: true,
        }
      }
    );
    if (isFullImage) {
      // Pull the frame back against the advancing facade for a clear dolly-zoom illusion.
      gsap.fromTo(wrap, { scale: 1 }, {
        scale: .86,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });
}

window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});

// Open each asset class as an editorial story, while keeping the card links
// usable as ordinary anchors when JavaScript is unavailable.
const sectorDialog = document.getElementById('sectorDialog');
if (sectorDialog?.showModal) {
  const sectorStories = {
    commercial: {
      number: '01 / COMMERCIAL', title: 'Commercial',
      description: 'Places designed for businesses to be seen, reached, and remembered. We shape commercial destinations around strong locations, efficient buildings, and lasting demand.',
      image: '/assets/images/sector-commercial.webp', alt: 'Contemporary commercial tower facade',
      points: ['Prime retail and corporate locations', 'Purposeful planning and flexible spaces', 'Built for enduring asset value'],
    },
    hospitality: {
      number: '02 / HOSPITALITY', title: 'Hospitality',
      description: 'Distinctive destinations that make the setting part of the experience. Architecture, landscape, and thoughtful amenities come together to create places guests want to return to.',
      image: '/assets/images/home-hospitality.webp', alt: 'Quiet resort terrace overlooking the coast',
      points: ['Experience-led destinations', 'Architecture in conversation with nature', 'Spaces made for memorable stays'],
    },
    residential: {
      number: '03 / RESIDENTIAL', title: 'Residential Plots',
      description: 'A more considered way to build a community. We plan residential land around access, generous open space, and the everyday quality of life that gives a place its value.',
      image: '/assets/images/home-residential-plots.webp', alt: 'Green land parcels and a road seen from above',
      points: ['Masterplanned neighbourhoods', 'Connected streets and open spaces', 'Room to grow for the long term'],
    },
    returns: {
      number: '04 / INVESTMENT', title: 'Investor Returns',
      description: 'Development opportunities grounded in clear project fundamentals. We bring together location, delivery discipline, and a defined investment approach to create measurable value.',
      image: '/assets/images/home-investor-returns.webp', alt: 'Minimal architectural stairway in evening light',
      points: ['Project-led investment structures', 'Transparent milestones and terms', 'A clear view of the path to value'],
    },
  };
  const image = document.getElementById('sectorDialogImage');
  const kicker = document.getElementById('sectorDialogKicker');
  const title = document.getElementById('sectorDialogTitle');
  const description = document.getElementById('sectorDialogDescription');
  const points = document.getElementById('sectorDialogPoints');
  const closeButton = sectorDialog.querySelector('.sector-dialog-close');
  let lastTrigger;
  const closeSectorDialog = () => {
    if (!sectorDialog.open || sectorDialog.classList.contains('is-leaving')) return;
    sectorDialog.classList.add('is-leaving');
    window.setTimeout(() => sectorDialog.close(), reducedMotion ? 0 : 260);
  };
  document.querySelectorAll('.persona-link[data-sector]').forEach(link => {
    link.addEventListener('click', event => {
      const story = sectorStories[link.dataset.sector];
      if (!story) return;
      event.preventDefault();
      lastTrigger = link;
      image.src = story.image;
      image.alt = story.alt;
      kicker.textContent = story.number;
      title.textContent = story.title;
      description.textContent = story.description;
      points.replaceChildren(...story.points.map(point => {
        const item = document.createElement('li');
        item.textContent = point;
        return item;
      }));
      sectorDialog.classList.remove('is-leaving');
      sectorDialog.showModal();
      document.body.classList.add('sector-dialog-open');
      closeButton.focus();
    });
  });
  closeButton.addEventListener('click', closeSectorDialog);
  sectorDialog.addEventListener('click', event => {
    if (event.target === sectorDialog) closeSectorDialog();
  });
  sectorDialog.addEventListener('close', () => {
    sectorDialog.classList.remove('is-leaving');
    document.body.classList.remove('sector-dialog-open');
    lastTrigger?.focus();
  });
}

// Keep the four audience stories in one compact, keyboard-accessible view.
const audienceSection = document.querySelector('.home-audience-section');
if (audienceSection) {
  const tabs = [...audienceSection.querySelectorAll('[role="tab"]')];
  const panels = [...audienceSection.querySelectorAll('[role="tabpanel"]')];
  let currentPanel;
  let audienceTransition;
  let autoTimer;
  let autoGeneration = 0;
  let storyReadyAt = performance.now();
  let isInView = false;
  let isKeyboardFocused = false;
  const stopAuto = () => {
    autoGeneration += 1;
    window.clearTimeout(autoTimer);
    autoTimer = undefined;
  };
  const scheduleAuto = () => {
    stopAuto();
    if (reducedMotion || !isInView || currentPanel?.querySelector('.services_halves_image_wrap:hover') || isKeyboardFocused || document.hidden || audienceTransition) return;
    const generation = autoGeneration;
    const activePanel = currentPanel;
    autoTimer = window.setTimeout(() => {
      if (generation !== autoGeneration || audienceTransition || currentPanel !== activePanel || !isInView || document.hidden) return;
      const nextPanel = panels[(panels.indexOf(currentPanel) + 1) % panels.length];
      showAudience(nextPanel.id);
    }, Math.max(0, storyReadyAt + 1000 - performance.now()));
  };
  const activateAudience = (activeTab, focus = false) => {
    const id = activeTab.getAttribute('aria-controls');
    tabs.forEach(tab => {
      const selected = tab === activeTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== id; });
    currentPanel = panels.find(panel => panel.id === id);
    storyReadyAt = performance.now();
    if (focus) activeTab.focus();
    ScrollTrigger.refresh();
  };
  const showAudience = (id, focus = false) => {
    stopAuto();
    const activeTab = tabs.find(tab => tab.getAttribute('aria-controls') === id) || tabs[0];
    const nextPanel = panels.find(panel => panel.id === activeTab?.getAttribute('aria-controls'));
    if (audienceTransition) audienceTransition.progress(1);
    if (!nextPanel || currentPanel === nextPanel) {
      if (focus) activeTab?.focus();
      scheduleAuto();
      return;
    }
    if (reducedMotion || !currentPanel) {
      activateAudience(activeTab, focus);
      scheduleAuto();
      return;
    }

    const previousPanel = currentPanel;
    const direction = panels.indexOf(nextPanel) % 2 === 1 ? 1 : -1;
    const previousCopy = previousPanel.querySelectorAll('.services_halves_text_top, .services_halves_rich');
    const previousImage = previousPanel.querySelector('.services_halves_image_wrap');
    const nextCopy = nextPanel.querySelectorAll('.services_halves_text_top, .services_halves_rich');
    const nextImage = nextPanel.querySelector('.services_halves_image_wrap');
    const nextPhoto = nextPanel.querySelector('.services_halves_image');
    if (focus) activeTab.focus();

    audienceTransition = gsap.timeline({
      onComplete: () => {
        gsap.set([...previousCopy, previousImage, ...nextCopy, nextImage, nextPhoto], { clearProps: 'all' });
        audienceTransition = null;
        storyReadyAt = performance.now();
        ScrollTrigger.refresh();
        scheduleAuto();
      },
    })
      .to(previousCopy, { x: -22 * direction, autoAlpha: 0, duration: .2, stagger: .035, ease: 'power2.in' }, 0)
      .to(previousImage, { clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', duration: .3, ease: 'power2.inOut' }, 0)
      .call(() => {
        activateAudience(activeTab);
        gsap.set(nextCopy, { x: 26 * direction, autoAlpha: 0 });
        gsap.set(nextImage, { clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' });
        gsap.set(nextPhoto, { scale: 1.12, xPercent: 4 * direction });
      }, null, .31)
      .to(nextImage, { clipPath: 'inset(0 0% 0 0%)', duration: .66, ease: 'power3.out' }, .32)
      .to(nextPhoto, { scale: 1, xPercent: 0, duration: .9, ease: 'power3.out' }, .32)
      .to(nextCopy, { x: 0, autoAlpha: 1, duration: .6, stagger: .08, ease: 'power3.out' }, .42);
  };
  audienceSection.classList.add('is-enhanced');
  activateAudience(tabs.find(tab => tab.getAttribute('aria-controls') === location.hash.slice(1)) || tabs[0]);
  const visibilityObserver = new IntersectionObserver(entries => {
    isInView = entries[0].isIntersecting;
    if (isInView) scheduleAuto(); else stopAuto();
  }, { threshold: .25 });
  visibilityObserver.observe(audienceSection);
  if (window.matchMedia('(hover: hover)').matches) {
    audienceSection.querySelectorAll('.services_halves_image_wrap').forEach(image => {
      image.addEventListener('mouseenter', stopAuto);
      image.addEventListener('mouseleave', scheduleAuto);
    });
  }
  audienceSection.addEventListener('focusin', event => {
    if (event.target.matches('.home-audience-tab:focus-visible')) {
      isKeyboardFocused = true;
      stopAuto();
    }
  });
  audienceSection.addEventListener('focusout', event => {
    if (!audienceSection.contains(event.relatedTarget)) {
      isKeyboardFocused = false;
      scheduleAuto();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto(); else scheduleAuto();
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      showAudience(tab.getAttribute('aria-controls'));
      history.replaceState(null, '', `#${tab.getAttribute('aria-controls')}`);
    });
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0 && event.key !== 'ArrowLeft') return;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextTab = tabs[(next + tabs.length) % tabs.length];
      showAudience(nextTab.getAttribute('aria-controls'), true);
      history.replaceState(null, '', `#${nextTab.getAttribute('aria-controls')}`);
    });
  });
  window.addEventListener('hashchange', () => {
    if (panels.some(panel => `#${panel.id}` === location.hash)) showAudience(location.hash.slice(1));
  });
}

// Use three different architectural reveals at the main home-page handoffs.
if (!reducedMotion && document.querySelector('.home-audience-intro')) {
  const intro = document.querySelector('.home-audience-intro');
  const introRule = intro.querySelector('.u-container');
  gsap.timeline({ scrollTrigger: { trigger: intro, start: 'top 84%', once: true } })
    .from(introRule, { '--audience-rule-scale': 0, duration: .95, ease: 'power3.out' }, 0)
    .from(intro.querySelector('.u-subheading'), { x: -32, autoAlpha: 0, duration: .65, ease: 'power3.out' }, .08)
    .from(intro.querySelector('h2'), { y: 58, clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power3.out' }, .16)
    .from(intro.querySelector('p'), { y: 22, autoAlpha: 0, duration: .65, ease: 'power2.out' }, .48);

  gsap.from('.home-audience-tabs', {
    scrollTrigger: { trigger: '.home-audience-tabs', start: 'top 90%', once: true },
    clipPath: 'inset(0 100% 0 0)', duration: .9, ease: 'power3.inOut',
  });

  const portfolio = document.querySelector('.done-deals_home_section');
  if (portfolio) {
    gsap.timeline({ scrollTrigger: { trigger: portfolio, start: 'top 86%', once: true } })
      .from(portfolio.querySelector('.u-subheading'), { x: -28, autoAlpha: 0, duration: .55, ease: 'power2.out' }, 0)
      .from(portfolio.querySelector('.u-heading-h2'), { y: 54, clipPath: 'inset(0 0 100% 0)', duration: .85, ease: 'power3.out' }, .1)
      .from(portfolio.querySelector('.done-deals_header_cta'), { y: 20, autoAlpha: 0, duration: .5, ease: 'power2.out' }, .45);
    const firstProject = portfolio.querySelector('.featured-projects_collection_item');
    if (firstProject) {
      gsap.from(firstProject.querySelector('.done-deals_component_image_wrap'), {
        scrollTrigger: { trigger: firstProject, start: 'top 92%', once: true },
        clipPath: 'polygon(0 0, 16% 0, 0 100%, 0 100%)', duration: 1.1, ease: 'power3.inOut',
      });
    }
  }
}

// -------------------------------------------------------------
// Shared inner-page continuity reveals
// -------------------------------------------------------------
// The home page already has detailed motion choreography. These small,
// once-only reveals give the supporting routes the same sense of pacing
// without changing their architectural layouts or colour system.
if (!reducedMotion) {
  const continuityTargets = document.querySelectorAll(
    '.services_halves_section:not(.home-audience-section) .services_halves_collection_item,' +
    '.accordion_services_item,' +
    '.team_feature_image_wrap,' +
    '.team_philosophy_grid,' +
    '.team_founder_split,' +
    '.team_directors_divider,' +
    '.team_director_card,' +
    '.reference-contact-inner'
  );

  continuityTargets.forEach((element, index) => {
    gsap.from(element, {
      y: 24,
      opacity: 0,
      duration: 0.72,
      delay: Math.min(index * 0.04, 0.22),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        once: true,
      },
    });
  });
}
