// GitHub hover effect functionality
document.addEventListener('DOMContentLoaded', function() {
  // Function to handle GitHub icon clicks
  function handleProjectTitleHover() {
    // Get all project title links
    const projectLinks = document.querySelectorAll('.project-header a');
    
    projectLinks.forEach(link => {
      // Save the original URL to restore when not hovering
      const originalUrl = link.getAttribute('href');
      const repoUrl = link.getAttribute('data-repo-url');
      
      // Check if we have a repo URL
      if (!repoUrl) return;
      
      // Create mouseenter event to change link destination
      link.addEventListener('mouseenter', function() {
        link.setAttribute('href', repoUrl);
      });
      
      // Create mouseleave event to restore original link destination
      link.addEventListener('mouseleave', function() {
        link.setAttribute('href', originalUrl);
      });
    });
  }

  // Initial setup when DOM is loaded
  handleProjectTitleHover();
  
  // Setup a MutationObserver to handle dynamically added project cards
  const projectsGrid = document.querySelector('.projects-grid');
  const featuredGrid = document.querySelector('.featured-grid');
  
  if (projectsGrid || featuredGrid) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // When new projects are added, re-apply the hover effect
          handleProjectTitleHover();
        }
      });
    });
    
    // Observe both grids if they exist
    if (projectsGrid) {
      observer.observe(projectsGrid, { childList: true });
    }
    
    if (featuredGrid) {
      observer.observe(featuredGrid, { childList: true });
    }
  }
});
