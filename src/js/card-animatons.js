/**
 * Enhanced Project Card Animations
 * - Shine/glow effect following mouse movement
 * - Smooth fade-out for animations on unhover
 */
(function() {
    // Initialize on document ready
    document.addEventListener('DOMContentLoaded', function() {
      initCardAnimations();
    });
  
    // Initialize animations for all project cards
    function initCardAnimations() {
      // Mouse tracking for shine effect
      const projectCards = document.querySelectorAll('.project-card');
      
      projectCards.forEach(card => {
        // Track mouse movement for shine effect
        card.addEventListener('mousemove', handleMouseMove);
        
        // Handle animation transitions on mouse enter/leave
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
        
        // Add initialization class for debugging
        card.classList.add('shine-effect-initialized');
      });
      
      // Set up mutation observer to handle dynamically added cards
      observeDynamicCards();
    }
    
    // Track mouse movement for shine effect
    function handleMouseMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
    
    // Handle mouse enter - prepare animations
    function handleMouseEnter(e) {
      const card = e.currentTarget;
      
      // Remove leaving state if it exists
      card.classList.remove('animation-leaving');
      
      // Force browser to recognize the state change
      void card.offsetWidth;
    }
    
    // Handle mouse leave - smooth fade out animations
    function handleMouseLeave(e) {
      const card = e.currentTarget;
      
      // Add class for fade-out animations
      card.classList.add('animation-leaving');
      
      // Remove the class after animations complete
      setTimeout(() => {
        if (card && card.classList.contains('animation-leaving')) {
          card.classList.remove('animation-leaving');
        }
      }, 500); // Match this to the CSS animation duration
    }
    
    // Set up observer for dynamically added cards
    function observeDynamicCards() {
      const projectsGrid = document.querySelector('.projects-grid');
      const featuredGrid = document.querySelector('.featured-grid');
      
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check each added node
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && node.classList.contains('project-card')) {
                // New card was added - initialize it
                node.addEventListener('mousemove', handleMouseMove);
                node.addEventListener('mouseenter', handleMouseEnter);
                node.addEventListener('mouseleave', handleMouseLeave);
                node.classList.add('shine-effect-initialized');
              }
            });
          }
        });
      });
      
      // Observe both grids for changes if they exist
      if (projectsGrid) {
        observer.observe(projectsGrid, { childList: true });
      }
      
      if (featuredGrid) {
        observer.observe(featuredGrid, { childList: true });
      }
    }
  })();