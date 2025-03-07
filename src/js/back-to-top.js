(function() {
  // Create the back to top button
  const backToTopButton = document.createElement('div');
  backToTopButton.className = 'back-to-top';
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopButton);
  
  // Show/hide the button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  // Add click event to scroll back to top
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();