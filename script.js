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

// Gallery lightbox
const groupButtons = document.querySelectorAll('.open-group');
const lightbox = document.getElementById('lightbox');
const lbImg = document.querySelector('.lb-img');
const lbCaption = document.querySelector('.lb-caption');
const lbPrev = document.querySelector('.lb-prev');
const lbNext = document.querySelector('.lb-next');
const lbClose = document.querySelector('.lb-close');

let currentGroup = [];
let currentIndex = 0;

function openLightbox(images, title, startIndex = 0) {
  currentGroup = images;
  currentIndex = startIndex;
  lbImg.src = currentGroup[currentIndex];
  lbImg.alt = title + ' - ' + (currentIndex + 1);
  lbCaption.textContent = `${title} (${currentIndex + 1} of ${currentGroup.length})`;
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
}

function showIndex(i) {
  if (!currentGroup.length) return;
  currentIndex = (i + currentGroup.length) % currentGroup.length;
  lbImg.src = currentGroup[currentIndex];
  lbCaption.textContent = `${lbImg.alt.split(' - ')[0] || 'Image'} (${currentIndex + 1} of ${currentGroup.length})`;
}

groupButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.group-card');
    if (!card) return;
    const images = card.dataset.images ? card.dataset.images.split(',') : [];
    const title = card.dataset.title || '';
    openLightbox(images, title, 0);
  });
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target.classList.contains('lightbox-backdrop')) closeLightbox();
});

lbPrev.addEventListener('click', () => showIndex(currentIndex - 1));
lbNext.addEventListener('click', () => showIndex(currentIndex + 1));

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') showIndex(currentIndex - 1);
  if (e.key === 'ArrowRight') showIndex(currentIndex + 1);
  if (e.key === 'Escape') closeLightbox();
});
