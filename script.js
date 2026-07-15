let toggle;
let navLinks;
let groupCards;
let lightbox;
let lbCaption;
let lbPrev;
let lbNext;
let lbClose;
let carouselTrack;
let carouselContainer;

let currentGroup = [];
let currentIndex = 0;
let isMoving = false;
let slideWidth = 0;
let pointerStart = null;
let pointerDelta = 0;

function buildCarousel(images, title, startIndex = 0) {
  currentGroup = images.slice();
  currentIndex = startIndex;
  carouselTrack.innerHTML = '';
  const slides = [];

  currentGroup.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${title} - ${i + 1}`;
    slide.appendChild(img);
    slides.push(slide);
  });

  if (slides.length === 1) {
    slides.push(slides[0].cloneNode(true));
  }

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  carouselTrack.appendChild(lastClone);
  slides.forEach((s) => carouselTrack.appendChild(s));
  carouselTrack.appendChild(firstClone);

  slideWidth = carouselContainer.clientWidth;
  carouselTrack.style.transition = 'none';
  carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
  requestAnimationFrame(() => {
    carouselTrack.style.transition = 'transform 0.45s ease';
  });
  lbCaption.textContent = `${title} (${currentIndex + 1} of ${currentGroup.length})`;
}

function openLightbox(images, title, startIndex = 0) {
  buildCarousel(images, title, startIndex);
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
  carouselTrack.innerHTML = '';
}

function updateCaption() {
  const currentImage = carouselTrack.querySelector('.carousel-slide img');
  const title = currentImage ? currentImage.alt.split(' - ')[0] : '';
  lbCaption.textContent = `${title} (${currentIndex + 1} of ${currentGroup.length})`;
}

function goTo(index) {
  if (!currentGroup.length || isMoving) return;
  isMoving = true;
  currentIndex = (index + currentGroup.length) % currentGroup.length;
  carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
  updateCaption();
}

function nextSlide() { goTo(currentIndex + 1); }
function prevSlide() { goTo(currentIndex - 1); }

function attachCarouselListeners() {
  carouselTrack.addEventListener('transitionend', () => {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    if (slides.length === 0) {
      isMoving = false;
      return;
    }

    if (currentIndex >= currentGroup.length) {
      currentIndex = 0;
      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
      void carouselTrack.offsetWidth;
      carouselTrack.style.transition = 'transform 0.45s ease';
    }

    if (currentIndex < 0) {
      currentIndex = currentGroup.length - 1;
      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
      void carouselTrack.offsetWidth;
      carouselTrack.style.transition = 'transform 0.45s ease';
    }

    updateCaption();
    isMoving = false;
  });

  groupCards.forEach((card) => {
    card.addEventListener('click', () => {
      const images = card.dataset.images ? card.dataset.images.split(',') : [];
      const title = card.dataset.title || '';
      openLightbox(images, title, 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-backdrop')) closeLightbox();
  });

  lbPrev.addEventListener('click', prevSlide);
  lbNext.addEventListener('click', nextSlide);

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape') closeLightbox();
  });

  window.addEventListener('resize', () => {
    if (!carouselContainer) return;
    slideWidth = carouselContainer.clientWidth;
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
    void carouselTrack.offsetWidth;
    carouselTrack.style.transition = 'transform 0.45s ease';
  });

  carouselContainer.addEventListener('pointerdown', (e) => {
    pointerStart = e.clientX;
    carouselTrack.style.transition = 'none';
    carouselContainer.setPointerCapture(e.pointerId);
  });

  carouselContainer.addEventListener('pointermove', (e) => {
    if (pointerStart === null) return;
    pointerDelta = e.clientX - pointerStart;
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth + pointerDelta}px)`;
  });

  carouselContainer.addEventListener('pointerup', () => {
    if (pointerStart === null) return;
    carouselTrack.style.transition = 'transform 0.45s ease';
    if (Math.abs(pointerDelta) > 60) {
      if (pointerDelta > 0) prevSlide(); else nextSlide();
    } else {
      carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
    }
    pointerStart = null;
    pointerDelta = 0;
  });
}

function init() {
  toggle = document.querySelector('.menu-toggle');
  navLinks = document.querySelector('.nav-links');
  groupCards = document.querySelectorAll('.group-card');
  lightbox = document.getElementById('lightbox');
  lbCaption = document.querySelector('.lb-caption');
  lbPrev = document.querySelector('.lb-prev');
  lbNext = document.querySelector('.lb-next');
  lbClose = document.querySelector('.lb-close');
  carouselTrack = document.querySelector('.carousel-track');
  carouselContainer = document.querySelector('.carousel');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  if (!groupCards.length || !lightbox || !lbCaption || !lbPrev || !lbNext || !lbClose || !carouselTrack || !carouselContainer) {
    return;
  }

  attachCarouselListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* Wave canvas animation (lightweight sine waves) */
(function () {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let rafId = null;

  const waves = [
    { amp: 18, len: 0.012, speed: 0.8, phase: 0, color: 'rgba(58,134,255,0.14)' },
    { amp: 10, len: 0.01, speed: 0.6, phase: 50, color: 'rgba(76,201,240,0.10)' },
    { amp: 6, len: 0.008, speed: 0.4, phase: 100, color: 'rgba(255,255,255,0.04)' }
  ];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(0, Math.floor(width * dpr));
    canvas.height = Math.max(0, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    waves.forEach((w) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 2) {
        const y = height / 2 + Math.sin((x * w.len) + (t * w.speed) + w.phase) * w.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
    });
    t += 0.016;
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    draw();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._waveResizeTimer);
    window._waveResizeTimer = setTimeout(() => {
      resize();
    }, 120);
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    window.addEventListener('DOMContentLoaded', start);
  }
})();
