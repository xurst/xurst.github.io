(function() {
  let lastScrollTop = 0;
  const topbar = document.querySelector('.topbar');
  const profileSection = document.querySelector('.profile-section');
  const projectsSection = document.querySelector('.projects-section');
  const aboutSection = document.querySelector('.about-me-section');
  const featuredSection = document.querySelector('.featured-section');
  
  // Navigation items
  const topProfile = document.getElementById('top-profile');
  const topProjects = document.getElementById('top-projects');
  const topFeatured = document.getElementById('top-featured');
  const topAbout = document.getElementById('top-about');
  
  // Initial topbar state - hidden when at top
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Set the position fixed or absolute based on scroll
    if (scrollTop > 50) { // Change to fixed position after scrolling past header
      if (!topbar.classList.contains('topbar-fixed')) {
        topbar.classList.add('topbar-fixed');
      }
      
      // Only hide on scroll down when not at the top
      if (scrollTop > lastScrollTop && scrollTop > 250) {
        topbar.classList.add('topbar-hidden');
      } else {
        topbar.classList.remove('topbar-hidden');
      }
    } else {
      // At the top or near top, use absolute positioning
      topbar.classList.remove('topbar-fixed');
      topbar.classList.remove('topbar-hidden');
    }
    
    lastScrollTop = scrollTop;
    
    // Update active state based on scroll position
    updateActiveState();
  });
  
  // Get section positions with offset adjustments
  function getSectionPositions() {
    // Detection thresholds determine when a section becomes "active" in the nav
    // You can adjust these to control highlight timing
    const detectionThresholds = {
      profileBottom: 20,  // When to stop highlighting profile
      projectsTop: 50,    // When to start highlighting projects
      projectsBottom: 1, // When to stop highlighting projects
      featuredTop: 100,    // When to start highlighting featured
      featuredBottom: 20, // When to stop highlighting featured
      aboutTop: 400        // When to start highlighting about
    };
    
    return [
      { el: topProfile, top: 0, bottom: profileSection ? profileSection.offsetTop + profileSection.offsetHeight - detectionThresholds.profileBottom : 0 },
      { el: topProjects, top: projectsSection ? projectsSection.offsetTop - detectionThresholds.projectsTop : 0, bottom: projectsSection ? projectsSection.offsetTop + projectsSection.offsetHeight - detectionThresholds.projectsBottom : 0 },
      { el: topFeatured, top: featuredSection ? featuredSection.offsetTop - detectionThresholds.featuredTop : 0, bottom: featuredSection ? featuredSection.offsetTop + featuredSection.offsetHeight - detectionThresholds.featuredBottom : 0 },
      { el: topAbout, top: aboutSection ? aboutSection.offsetTop - detectionThresholds.aboutTop : 0, bottom: aboutSection ? aboutSection.offsetTop + aboutSection.offsetHeight : 0 }
    ];
  }
  
  // Update active state of navigation items
  function updateActiveState() {
    const scrollPos = window.scrollY + 50;
    const sections = getSectionPositions();
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const scrollBottom = window.scrollY + window.innerHeight;
    
    // Remove all active classes
    sections.forEach(item => item.el && item.el.classList.remove('active'));
    
    // Special case for About section - it's at the bottom
    // If we're near the bottom of the page, highlight about
    if (scrollBottom >= documentHeight - 100 && topAbout) {
      topAbout.classList.add('active');
      return;
    }
    
    // Add active class to the current section
    for (const item of sections) {
      if (item.el && scrollPos >= item.top && scrollPos < item.bottom) {
        item.el.classList.add('active');
        break;
      }
    }
    
    // If we're at the very top, highlight profile
    if (window.scrollY < 20 && topProfile) {
      sections.forEach(item => item.el && item.el.classList.remove('active'));
      topProfile.classList.add('active');
    }
  }
  
  // Scroll to specific positions with precise control
  // You can adjust these offsets to control exactly where each click scrolls to
  const scrollOffsets = {
    profile: 0,            // Top of page
    projects: -95,         // Adjust this value to scroll higher/lower
    featured: -95,         // Adjust this value to scroll higher/lower
    about: 200               // Adjust this value to scroll higher/lower
  };
  
  // Add click handlers with custom offsets
  if (topProfile) {
    topProfile.addEventListener('click', () => {
      // Scroll to the very top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  if (topProjects) {
    topProjects.addEventListener('click', () => {
      if (!projectsSection) return;
      // Scroll to projects section with custom offset
      window.scrollTo({
        top: projectsSection.offsetTop + scrollOffsets.projects,
        behavior: 'smooth'
      });
    });
  }
  
  if (topFeatured) {
    topFeatured.addEventListener('click', () => {
      if (!featuredSection) return;
      // Scroll to featured section with custom offset
      window.scrollTo({
        top: featuredSection.offsetTop + scrollOffsets.featured,
        behavior: 'smooth'
      });
    });
  }
  
  if (topAbout) {
    topAbout.addEventListener('click', () => {
      // Scroll to the bottom of the page
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      window.scrollTo({
        top: documentHeight,
        behavior: 'smooth'
      });
    });
  }
  
  // Initialize active state
  window.addEventListener('load', updateActiveState);
})();