(function() {
  const GITHUB_USERNAME = 'xurst';
  const GITHUB_API_BASE = 'https://api.github.com';
  const featuredGrid = document.querySelector('.featured-grid');
  
  async function fetchTopProjects() {
    try {
      // First fetch all repos
      const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos`);
      if (!response.ok) throw new Error('failed to fetch repositories');
      
      const repos = await response.json();
      
      // Filter out fork and profile repos
      const ownRepos = repos.filter(repo => !repo.fork && repo.name !== `${GITHUB_USERNAME}.github.io`);
      
      // Sort by stars (most to least)
      const sortedRepos = ownRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      
      // Get top 3 (or fewer if there aren't 3)
      const topRepos = sortedRepos.slice(0, 3);
      
      // Fetch additional details and languages for top repos
      const featuredProjectsPromises = topRepos.map(async (repo) => {
        try {
          // Fetch languages
          const langResponse = await fetch(repo.languages_url);
          const languages = await langResponse.json();
          
          // Format top languages
          const topLangs = Object.keys(languages).slice(0, 2).join(' & ').toLowerCase();
          
          return {
            ...repo,
            languages: topLangs
          };
        } catch (error) {
          console.error(`Error fetching details for ${repo.name}:`, error);
          return {
            ...repo,
            languages: ''
          };
        }
      });
      
      const featuredProjects = await Promise.all(featuredProjectsPromises);
      
      // Clear placeholder and display featured projects
      featuredGrid.innerHTML = '';
      
      if (featuredProjects.length === 0) {
        featuredGrid.innerHTML = '<div class="featured-placeholder">no featured projects available</div>';
        return;
      }
      
      // Create cards for featured projects
      featuredProjects.forEach((project, index) => {
        const projectUrl = project.homepage || project.html_url;
        const description = (project.description || 'no description available')
          .replace(/\\s*\\([^)]*\\)\\s*$/, ''); // Remove category tag
        
        featuredGrid.innerHTML += `
          <div class="featured-card fade-in">
            <div class="featured-card-badge">featured #${index + 1}</div>
            <div class="featured-card-header">
              <a href="${projectUrl}" class="featured-card-title" target="_blank">${project.name}</a>
              <div class="featured-card-stars">
                <i class="fas fa-star"></i> ${project.stargazers_count}
              </div>
            </div>
            <div class="featured-card-desc">${description}</div>
            ${project.languages ? `
              <div class="featured-card-languages">
                <i class="fas fa-code"></i> ${project.languages}
              </div>
            ` : ''}
          </div>
        `;
      });
      
      // Re-initialize fade-in animations
      const fadeInElems = document.querySelectorAll('.featured-card.fade-in');
      const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      });
      
      fadeInElems.forEach((el) => fadeInObserver.observe(el));
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      featuredGrid.innerHTML = '<div class="featured-placeholder">failed to load featured projects. try refreshing the page or try again later.</div>';
    }
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', fetchTopProjects);
})();