// ========================
// VAULT BANK — script.js
// ========================

// Scroll-to-top button
const scrollBtn = document.getElementById('scrollTop');
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // rotate arrow when near top vs bottom
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      scrollBtn.style.transform = 'rotate(180deg)';
    } else {
      scrollBtn.style.transform = 'rotate(0deg)';
    }
  });
}

// Navbar background opacity on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.style.background = 'rgba(232,245,233,0.95)';
    navbar.style.boxShadow = '0 2px 20px rgba(46,125,50,0.08)';
  } else {
    navbar.style.background = 'rgba(232,245,233,0.75)';
    navbar.style.boxShadow = 'none';
  }
});

// Intersection Observer for service cards (re-trigger animation on scroll)
const cards = document.querySelectorAll('.service-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => {
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});

// Bank card tilt effect
const bankCard = document.querySelector('.bank-card');
if (bankCard) {
  bankCard.addEventListener('mousemove', (e) => {
    const rect = bankCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    bankCard.style.transform = `perspective(600px) rotateY(${x * 18}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    bankCard.style.animation = 'none';
  });

  bankCard.addEventListener('mouseleave', () => {
    bankCard.style.transform = '';
    bankCard.style.animation = 'float 6s ease-in-out infinite';
  });
}

// Stat counter animation
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('counted');
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => {
  el.style.transition = 'opacity 0.5s';
  statObserver.observe(el);
});

// Smooth button ripple effect
document.querySelectorAll('.btn-solid, .btn-outline').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size/2}px;
      top:  ${e.clientY - rect.top  - size/2}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      transform: scale(0);
      animation: ripple 0.5s ease-out forwards;
      pointer-events: none;
    `;
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = '@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }';
      document.head.appendChild(style);
    }
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});
