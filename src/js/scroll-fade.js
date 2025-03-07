/* scroll_fade.js */

(function() {
  // Prevent scroll on page load
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  
  // Create and insert Scroll-to-Top Button
  const scrollBtn = document.createElement('button');
  scrollBtn.id = 'scrollToTopBtn';
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollBtn);

  // Add fade-in class to all major elements
  const addFadeClasses = () => {
    const elementsToFade = [
      '.profile-section',
      '.projects-section h2',
      '.projects-controls',
      '.project-card',
      '.about-me-section',
      '.featured-section',
      '.about-content',
      '.topbar',
      '.topbar-item'
    ];
    
    elementsToFade.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('fade-in')) {
          el.classList.add('fade-in');
        }
      });
    });
  };

  // Initialize the fade observer
  const initFadeObserver = () => {
    const fadeInElems = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      rootMargin: '0px',
      threshold: 0.05  // More sensitive threshold
    });
    
    fadeInElems.forEach((el) => fadeInObserver.observe(el));
  };

  // Scroll-to-Top button visibility
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  });

  // Smooth scroll to top
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initialize everything after DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    addFadeClasses();
    initFadeObserver();
  });

  // Also run after content might have been dynamically added
  window.addEventListener('load', () => {
    setTimeout(() => {
      addFadeClasses();
      initFadeObserver();
    }, 500);
  });
})();