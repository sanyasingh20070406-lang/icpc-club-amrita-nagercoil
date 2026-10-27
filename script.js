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
  currentGroup = images.map(img => img.trim()).filter(Boolean);
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
    carouselTrack.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  });
  lbCaption.textContent = `${title} (${currentIndex + 1} of ${currentGroup.length})`;
}

function openLightbox(images, title, startIndex = 0) {
  lightbox.classList.remove('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Stop scrolling behind lightbox
  buildCarousel(images, title, startIndex);
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.setAttribute('aria-hidden', 'true');
  carouselTrack.innerHTML = '';
  document.body.style.overflow = ''; // Re-enable scrolling
}

function updateCaption() {
  const currentImage = carouselTrack.querySelectorAll('.carousel-slide img')[currentIndex + 1];
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
      carouselTrack.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    if (currentIndex < 0) {
      currentIndex = currentGroup.length - 1;
      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
      void carouselTrack.offsetWidth;
      carouselTrack.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
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
    if (!carouselContainer || lightbox.classList.contains('hidden')) return;
    slideWidth = carouselContainer.clientWidth;
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(${-(currentIndex + 1) * slideWidth}px)`;
    void carouselTrack.offsetWidth;
    carouselTrack.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
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
    carouselTrack.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
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

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }

  initAnimations();

  if (!groupCards.length || !lightbox || !lbCaption || !lbPrev || !lbNext || !lbClose || !carouselTrack || !carouselContainer) {
    return;
  }

  attachCarouselListeners();
}

function initAnimations() {
  const animateElements = document.querySelectorAll('.card, .team-card, .motto-card, .resource-card, .group-card, .join-card, .section-label, h2, .split-layout p, .stats-panel, .hiring-panel, .hero-text > *, .timeline-item');
  
  animateElements.forEach((el) => {
    el.classList.add('scroll-animate');
    
    if (el.parentElement) {
      if (['card-grid', 'team-grid', 'motto-grid', 'gallery-groups', 'hero-text'].some(c => el.parentElement.classList.contains(c))) {
        const children = Array.from(el.parentElement.children);
        const childIndex = children.indexOf(el);
        if (childIndex === 1) el.classList.add('delay-100');
        else if (childIndex === 2) el.classList.add('delay-200');
        else if (childIndex === 3) el.classList.add('delay-300');
        else if (childIndex >= 4) el.classList.add('delay-400');
      }
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  animateElements.forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* Wave canvas animation (lightweight sine waves in official ICPC colors) */
(function () {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let rafId = null;

  // Tri-color waves matching Think (Red), Create (White), Solve (Blue)
  const waves = [
    { amp: 20, len: 0.010, speed: 0.6, phase: 0, color: 'rgba(255, 51, 102, 0.12)' },   // Crimson Red
    { amp: 14, len: 0.008, speed: 0.4, phase: 60, color: 'rgba(255, 255, 255, 0.07)' },  // Frosted White
    { amp: 10, len: 0.012, speed: 0.3, phase: 120, color: 'rgba(0, 82, 255, 0.1)' }     // Cyber Blue
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

// Auth State Management
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('icpc_token');
  const userStr = localStorage.getItem('icpc_user');
  
  const loginBtn = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const dashboardBtn = document.getElementById('nav-dashboard-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');

  if (token && userStr) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    const user = JSON.parse(userStr);
    if ((user.role === 'ADMIN' || user.role === 'admin') && dashboardBtn) {
      dashboardBtn.textContent = 'Admin Panel';
      dashboardBtn.href = 'admin.html';
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('icpc_token');
        localStorage.removeItem('icpc_user');
        window.location.href = 'index.html';
      });
    }
  }
});

// Photo Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('photo-modal');
  if (!modal) return;
  
  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const modalRole = document.getElementById('modal-role');
  const closeBtn = document.querySelector('.close-modal');

  // Add click event to all member photo wrappers
  const photoWrappers = document.querySelectorAll('.member-photo-wrapper');
  
  photoWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.member-card');
      const img = this.querySelector('img');
      const name = card.querySelector('.member-name').textContent;
      const role = card.querySelector('.member-role').textContent;

      modalImg.src = img.src;
      modalName.textContent = name;
      modalRole.textContent = role;

      modal.style.display = 'flex';
      // Small delay to allow display block to apply before adding class for transition
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  });

  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300); // Wait for transition
  };

  closeBtn.addEventListener('click', closeModal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
});

/* ==========================================================================
   ICPC Club Custom Fluid Moving Animation Cursor
   Theme: Think. Create. Solve. (Emerald Teal, Royal Blue, Algorithm Sparks)
   ========================================================================== */
(function initIcpcCursor() {
  if (typeof window === 'undefined') return;

  // Touch screen & reduced motion detection
  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches);

  if (isTouchDevice) return; // Keep native touch interactions on mobile & tablets

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Prevent duplicate initialization
  if (window.__icpcCursorInitialized) return;
  window.__icpcCursorInitialized = true;

  function setupCursor() {
    if (!document.body) return;

    // Enable desktop CSS cursor styling
    document.body.classList.add('icpc-custom-cursor-enabled');

    // Create cursor DOM elements
    const container = document.createElement('div');
    container.id = 'icpc-cursor-container';
    container.className = 'cursor-hidden'; // Hidden until first mousemove
    container.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.id = 'icpc-cursor-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    const aura = document.createElement('div');
    aura.className = 'icpc-cursor-aura';

    const dot = document.createElement('div');
    dot.className = 'icpc-cursor-dot';

    container.appendChild(canvas);
    container.appendChild(aura);
    container.appendChild(dot);
    document.body.appendChild(container);

    // Canvas 2D context for algorithmic sparks
    const ctx = canvas.getContext('2d');
    let canvasW = 0, canvasH = 0;
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      canvasW = window.innerWidth;
      canvasH = window.innerHeight;
      canvas.width = Math.floor(canvasW * dpr);
      canvas.height = Math.floor(canvasH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Coordinates & Physics variables
    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;
    let targetX = -100, targetY = -100;
    let currentAngle = 0;
    let targetStretch = 1;
    let currentStretch = 1;
    let isClicking = false;
    let isVisible = false;
    let magnetTarget = null;

    // Particle spark pool
    const particles = [];
    const sparkColors = ['#14B8A6', '#2563EB', '#38BDF8', '#F59E0B', '#10B981'];

    function spawnParticle(x, y, speed, angleOffset = null) {
      if (particles.length > 22) return;
      const angle = angleOffset !== null ? angleOffset : Math.random() * Math.PI * 2;
      const velocity = (angleOffset !== null ? (Math.random() * 2 + 1.5) : (Math.random() * 1.5 + 0.5)) * Math.min(speed * 0.15 + 0.8, 3.5);
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 2.2 + 1.2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.035,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)]
      });
    }

    function createClickRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'icpc-cursor-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      container.appendChild(ripple);
      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 500);

      // Micro spark explosion on click
      for (let i = 0; i < 7; i++) {
        spawnParticle(x, y, 4, (i / 7) * Math.PI * 2);
      }
    }

    // Animation Render Loop
    let particleThrottle = 0;
    function render() {
      if (isVisible) {
        // Calculate destination considering optional magnetic pull
        let destX = mouseX;
        let destY = mouseY;

        if (magnetTarget) {
          const rect = magnetTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          // Soft magnetic gravity pull toward element center
          destX = mouseX + (centerX - mouseX) * 0.32;
          destY = mouseY + (centerY - mouseY) * 0.32;
        }

        // Smooth damped linear interpolation (Lerp)
        const dx = destX - followerX;
        const dy = destY - followerY;
        const dist = Math.hypot(dx, dy);

        followerX += dx * 0.18;
        followerY += dy * 0.18;

        // Dynamic aerodynamic stretch & squash along velocity vector
        if (dist > 1.2) {
          const targetAngle = Math.atan2(dy, dx);
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          currentAngle += angleDiff * 0.22;
          targetStretch = Math.min(1 + dist * 0.0035, 1.32);
        } else {
          targetStretch = 1;
        }

        currentStretch += (targetStretch - currentStretch) * 0.2;
        const squash = 1 / Math.max(0.65, currentStretch * 0.88);

        // Render follower aura
        aura.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) rotate(${currentAngle}rad) scale(${currentStretch}, ${squash})`;

        // Render pinpoint dot (instantaneous 1:1 aiming)
        const dotScale = isClicking ? 0.6 : 1;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${dotScale})`;

        // Spawn trailing sparks during swift movement
        particleThrottle++;
        if (dist > 3.5 && particleThrottle % 2 === 0) {
          spawnParticle(followerX, followerY, dist);
        }
      }

      // Render algorithmic spark particles on canvas
      if (particles.length > 0) {
        ctx.clearRect(0, 0, canvasW, canvasH);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.size *= 0.96;
          p.life -= p.decay;

          if (p.life <= 0 || p.size <= 0.4) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (!isVisible) {
        ctx.clearRect(0, 0, canvasW, canvasH);
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Mouse Event Handlers
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        followerX = mouseX;
        followerY = mouseY;
        container.classList.remove('cursor-hidden');
      }

      // Check hovered element
      const target = e.target;
      if (!target) return;

      // Text Input Detection
      const isText = target.closest('input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]');
      if (isText) {
        container.classList.add('is-hovering-text');
        container.classList.remove('is-hovering-interactive');
        magnetTarget = null;
        return;
      }
      container.classList.remove('is-hovering-text');

      // Interactive Element Detection
      const isInteractive = target.closest('a, button, .btn, [role="button"], .chip, .menu-toggle, .team-card, .group-card, .card, .resource-card, .faq-question, .edge-logo, .clickable, .member-photo-wrapper');
      if (isInteractive) {
        container.classList.add('is-hovering-interactive');
        // Magnetic attraction for buttons, nav-links and icon toggles
        if (target.closest('.btn, .nav-actions a, .menu-toggle, .edge-logo, .hero-actions a')) {
          magnetTarget = target.closest('.btn, .nav-actions a, .menu-toggle, .edge-logo, .hero-actions a');
        } else {
          magnetTarget = null;
        }
      } else {
        container.classList.remove('is-hovering-interactive');
        magnetTarget = null;
      }
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      isClicking = true;
      container.classList.add('is-clicking');
      createClickRipple(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      isClicking = false;
      container.classList.remove('is-clicking');
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      container.classList.add('cursor-hidden');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      container.classList.remove('cursor-hidden');
    });

    window.addEventListener('blur', () => {
      isVisible = false;
      container.classList.add('cursor-hidden');
    });

    window.addEventListener('focus', () => {
      isVisible = true;
      container.classList.remove('cursor-hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();




