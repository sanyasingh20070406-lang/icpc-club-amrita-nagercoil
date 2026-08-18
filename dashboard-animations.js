/**
 * dashboard-animations.js
 * Scoped entirely to #dashboard-wrapper
 */
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('dashboard-wrapper');
  if (!wrapper) return;

  // 1. Custom Cursor
  const cursor = wrapper.querySelector('.custom-cursor');
  if (cursor) {
    wrapper.addEventListener('mousemove', (e) => {
      // Calculate cursor position relative to viewport
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    // Make cursor larger on hover over interactive elements
    const interactives = wrapper.querySelectorAll('a, button, .project-card-wrap');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => wrapper.classList.add('hovering-interactive'));
      el.addEventListener('mouseleave', () => wrapper.classList.remove('hovering-interactive'));
    });
  }

  // 2. Page Load Animations
  // Add slight delay for staggered intro effect
  setTimeout(() => {
    wrapper.classList.add('is-loaded');
  }, 100);

  // 3. Scroll Reveal Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = wrapper.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => observer.observe(el));

  // 4. 3D Hover Interactions on Project Cards
  const projectCards = wrapper.querySelectorAll('.project-card-wrap');
  
  projectCards.forEach(cardWrap => {
    const cardInner = cardWrap.querySelector('.project-card-inner');
    if (!cardInner) return;

    cardWrap.addEventListener('mousemove', (e) => {
      const rect = cardWrap.getBoundingClientRect();
      // Mouse position relative to the center of the card (-1 to 1)
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      // Rotate up to 10 degrees on X and Y
      const rotateX = y * -10; 
      const rotateY = x * 10;
      
      cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardWrap.addEventListener('mouseleave', () => {
      // Reset transform when mouse leaves
      cardInner.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  });
});
