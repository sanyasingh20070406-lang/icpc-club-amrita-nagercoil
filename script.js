const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

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

// Gallery lightbox with carousel
const groupCards = document.querySelectorAll('.group-card');
const lightbox = document.getElementById('lightbox');
const lbCaption = document.querySelector('.lb-caption');
const lbPrev = document.querySelector('.lb-prev');
const lbNext = document.querySelector('.lb-next');
const lbClose = document.querySelector('.lb-close');
const carouselTrack = document.querySelector('.carousel-track');
const carouselContainer = document.querySelector('.carousel');

let currentGroup = [];
let currentIndex = 0;
let isMoving = false;
let slideWidth = 0;

function buildCarousel(images, title, startIndex = 0) {
  currentGroup = images.slice();
  currentIndex = startIndex;
  // clear track
  carouselTrack.innerHTML = '';
  // create slides
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
  // If only one image, still allow loop by duplicating
  if (slides.length === 1) {
    const clone = slides[0].cloneNode(true);
    slides.push(clone);
  }
  // clone first and last for infinite loop
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  carouselTrack.appendChild(lastClone);
  slides.forEach((s) => carouselTrack.appendChild(s));
  carouselTrack.appendChild(firstClone);

  // set sizes
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

function goTo(index) {
  if (!currentGroup.length || isMoving) return;
  isMoving = true;
  currentIndex = (index + currentGroup.length) % currentGroup.length;
  carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
  lbCaption.textContent = `${carouselTrack.querySelector('.carousel-slide img').alt.split(' - ')[0] || ''} (${currentIndex + 1} of ${currentGroup.length})`;
}

function nextSlide() { goTo(currentIndex + 1); }
function prevSlide() { goTo(currentIndex - 1); }

carouselTrack.addEventListener('transitionend', () => {
  // handle loop reset
  const slides = carouselTrack.querySelectorAll('.carousel-slide');
  const total = slides.length;
  if (slides.length === 0) { isMoving = false; return; }
  // when at cloned first (index = currentGroup.length) -> jump to real first
  if (currentIndex >= currentGroup.length) {
    currentIndex = 0;
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
    // force reflow then restore transition
    void carouselTrack.offsetWidth;
    carouselTrack.style.transition = 'transform 0.45s ease';
  }
  // when at cloned last (index = -1) -> jump to real last
  if (currentIndex < 0) {
    currentIndex = currentGroup.length - 1;
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
    void carouselTrack.offsetWidth;
    carouselTrack.style.transition = 'transform 0.45s ease';
  }
  lbCaption.textContent = `${carouselTrack.querySelector('.carousel-slide img').alt.split(' - ')[0] || ''} (${currentIndex + 1} of ${currentGroup.length})`;
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

// keyboard
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'Escape') closeLightbox();
});

// handle resize
window.addEventListener('resize', () => {
  if (!carouselContainer) return;
  slideWidth = carouselContainer.clientWidth;
  carouselTrack.style.transition = 'none';
  carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
  void carouselTrack.offsetWidth;
  carouselTrack.style.transition = 'transform 0.45s ease';
});

// touch / pointer swipe
let pointerStart = null;
let pointerDelta = 0;
carouselContainer.addEventListener('pointerdown', (e) => {
  pointerStart = e.clientX;
  carouselTrack.style.transition = 'none';
  carouselContainer.setPointerCapture(e.pointerId);
});

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
    ctx.scale(dpr, dpr);
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    waves.forEach((w, idx) => {
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
    // debounce
    clearTimeout(window._waveResizeTimer);
    window._waveResizeTimer = setTimeout(() => {
      resize();
    }, 120);
  });

  // start when DOM loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    window.addEventListener('DOMContentLoaded', start);
  }
})();
carouselContainer.addEventListener('pointermove', (e) => {
  if (pointerStart === null) return;
  pointerDelta = e.clientX - pointerStart;
  carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth + pointerDelta}px)`;
});
carouselContainer.addEventListener('pointerup', (e) => {
  if (pointerStart === null) return;
  carouselTrack.style.transition = 'transform 0.45s ease';
  if (Math.abs(pointerDelta) > 60) {
    if (pointerDelta > 0) prevSlide(); else nextSlide();
  } else {
    // snap back
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
  }
  pointerStart = null;
  pointerDelta = 0;
});
