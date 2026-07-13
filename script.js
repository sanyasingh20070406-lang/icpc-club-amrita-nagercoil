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
