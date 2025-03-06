(function() {
  const featuredGrid = document.querySelector('.featured-grid');
  
  // Use the same card creation function from main.js
  // This will be updated to use shared project cards for a consistent look
  
  async function fetchTopProjects() {
    try {
      // Show loading placeholder
      featuredGrid.innerHTML = '<div class="featured-placeholder">loading featured projects...</div>';
      
      // First fetch all repos using the GitHub API module
      const repos = await GitHubAPI.getUserRepos();
      
      // Filter out fork and profile repos
      const ownRepos = repos.filter(repo => !repo.fork && repo.name !== GitHubAPI.username + '.github.io');
      
      // Sort by stars (most to least)
      const sortedRepos = ownRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      
      // Get top 3 (or fewer if there aren't 3)
      const topRepos = sortedRepos.slice(0, 3);
      
      if (topRepos.length === 0) {
        featuredGrid.innerHTML = '<div class="featured-placeholder">no featured projects available</div>';
        return;
      }
      
      // Create project cards one by one (same as in main.js)
      const projectCards = [];
      for (const repo of topRepos) {
        try {
          // Get repo details for homepage URL
          const details = await GitHubAPI.getRepoDetails(repo.name);
          const fullRepo = { ...repo, homepage: details.homepage };
          
          // Use the main.js createProjectCard function if available, or create our own
          let card;
          if (typeof createProjectCard === 'function') {
            card = await createProjectCard(fullRepo);
          } else {
            // Fallback if we can't access the main function
            const languages = await GitHubAPI.getRepoLanguages(repo.name);
            const projectUrl = fullRepo.homepage || fullRepo.html_url;
            
            // Clean description - remove parentheses tags
            let description = fullRepo.description || "no description available";
            description = description.replace(/\s*\([^)]*\)\s*$/, "");
            
            // Format languages with proper grammar
            let languageDisplay = '';
            if (languages) {
              const languageKeys = Object.keys(languages).slice(0, 3);
              if (languageKeys.length === 1) {
                languageDisplay = languageKeys[0].toLowerCase();
              } else if (languageKeys.length === 2) {
                languageDisplay = `${languageKeys[0].toLowerCase()} & ${languageKeys[1].toLowerCase()}`;
              } else if (languageKeys.length === 3) {
                languageDisplay = `${languageKeys[0].toLowerCase()}, ${languageKeys[1].toLowerCase()}, & ${languageKeys[2].toLowerCase()}`;
              }
            }
            
            card = `
            <div class="project-card featured-project" data-name="${fullRepo.name}" data-stars="${fullRepo.stargazers_count}">
              <div class="featured-badge">featured #${topRepos.indexOf(repo) + 1}</div>
              <div class="project-header">
                <a href="${projectUrl}" target="_blank">${fullRepo.name}</a>
                <span class="project-stars"><i class="fas fa-star"></i> ${fullRepo.stargazers_count}</span>
              </div>
              <p>${description}</p>
              <div class="project-footer">
                <div class="last-updated">
                  <i class="fas fa-history"></i>
                  <span>last updated: ${new Date(fullRepo.pushed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).toLowerCase()}</span>
                </div>
                ${languages ? `
                  <div class="project-languages">
                    <i class="fas fa-code"></i>
                    <span>coded in ${languageDisplay}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
          }
          
          projectCards.push(card);
        } catch (error) {
          console.error(`Error creating card for ${repo.name}:`, error);
        }
      }
      
      // Clear placeholder and display featured projects
      featuredGrid.innerHTML = '';
      
      // Add each card to the grid
      projectCards.forEach(cardHtml => {
        featuredGrid.innerHTML += cardHtml;
      });
      
      // Add class for styling
      document.querySelectorAll('.featured-project').forEach(card => {
        card.classList.add('fade-in');
      });
      
      // Re-initialize fade-in animations
      const fadeInElems = document.querySelectorAll('.featured-project.fade-in');
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