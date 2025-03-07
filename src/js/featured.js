(function () {
  const featuredGrid = document.querySelector(".featured-grid");

  async function fetchTopProjects() {
    try {
      // Show loading placeholder
      featuredGrid.innerHTML =
        '<div class="featured-placeholder">loading featured projects...</div>';

      // First fetch all repos using the GitHub API module
      const repos = await GitHubAPI.getUserRepos();

      // Filter out fork and profile repos
      const ownRepos = repos.filter(
        (repo) => !repo.fork && repo.name !== GitHubAPI.username + ".github.io"
      );

      // Sort by stars (most to least)
      const sortedRepos = ownRepos.sort(
        (a, b) => b.stargazers_count - a.stargazers_count
      );

      // Get top 3 (or fewer if there aren't 3)
      const topRepos = sortedRepos.slice(0, 4);

      if (topRepos.length === 0) {
        featuredGrid.innerHTML =
          '<div class="featured-placeholder">no featured projects available</div>';
        return;
      }

      // Create project cards one by one (same as in main.js)
      const projectCards = [];
      for (const repo of topRepos) {
        try {
          // Get repo details for homepage URL
          const details = await GitHubAPI.getRepoDetails(repo.name);
          const fullRepo = { ...repo, homepage: details.homepage };

          const projectUrl = fullRepo.homepage || fullRepo.html_url;
          const visitType = fullRepo.homepage ? "website" : "repo";
          const languages = await GitHubAPI.getRepoLanguages(repo.name);
          const category = getProjectCategory(fullRepo);

          // Clean description - remove parentheses tags
          let description = fullRepo.description || "no description available";
          description = description.replace(/\s*\([^)]*\)\s*$/, "");

          // Format languages
          let languagesHtml = "";
          if (languages && Object.keys(languages).length > 0) {
            // Sort languages by bytes (most used first)
            const sortedLangs = Object.entries(languages)
              .sort((a, b) => b[1] - a[1])
              .map((entry) => entry[0].toLowerCase());

            // Take only the top 3 languages
            const topLangs = sortedLangs.slice(0, 3);

            if (topLangs.length > 0) {
              // Format with proper English grammar
              let langText = "";
              if (topLangs.length === 1) {
                langText = topLangs[0];
              } else if (topLangs.length === 2) {
                langText = `${topLangs[0]} & ${topLangs[1]}`;
              } else if (topLangs.length === 3) {
                langText = `${topLangs[0]}, ${topLangs[1]}, & ${topLangs[2]}`;
              }

              languagesHtml = `
                <div class="project-languages">
                  <i class="fas fa-code"></i>
                  <span>coded in ${langText}</span>
                </div>
              `;
            }
          }

          // Calculate featured rank
          const rank = topRepos.indexOf(repo) + 1;

          const card = `
            <div class="project-card featured-project" data-name="${
              fullRepo.name
            }" data-date="${
            fullRepo.pushed_at
          }" data-category="${category}" data-type="${visitType}">
              <div class="featured-badge">featured</div>
              <div class="project-header">
                <a href="${projectUrl}" target="_blank">${fullRepo.name}</a>
                <div class="project-tags">
                  <span class="project-category ${category}">${category}</span>
                  <span class="project-category ${visitType}">${visitType}</span>
                </div>
                <span class="click-indicator"><i class="fas fa-arrow-right"></i> click to visit</span>
              </div>
              <p>${description}</p>
              <div class="last-updated">
                <i class="fas fa-history"></i>
                <span>last updated: ${new Date(fullRepo.pushed_at)
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  .toLowerCase()}</span>
              </div>
              ${languagesHtml}
<div class="project-languages stars-info">
    <i class="fas fa-star"></i>
    <span>${
      fullRepo.stargazers_count === 1
        ? "1 star"
        : `${fullRepo.stargazers_count} stars`
    }</span>
</div>
            </div>
          `;

          projectCards.push(card);
        } catch (error) {
          console.error(`Error creating card for ${repo.name}:`, error);
        }
      }

      // Clear placeholder and display featured projects
      featuredGrid.innerHTML = "";

      // Add each card to the grid
      projectCards.forEach((cardHtml) => {
        featuredGrid.innerHTML += cardHtml;
      });

      // Add class for styling
      document.querySelectorAll(".featured-project").forEach((card) => {
        card.classList.add("fade-in");
      });

      // Re-initialize fade-in animations
      const fadeInElems = document.querySelectorAll(
        ".featured-project.fade-in"
      );
      const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      });

      fadeInElems.forEach((el) => fadeInObserver.observe(el));
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      featuredGrid.innerHTML =
        '<div class="featured-placeholder">failed to load featured projects. try refreshing the page or try again later.</div>';
    }
  }

  // Helper function to determine project category
  function getProjectCategory(repo) {
    // Default category
    let category = "project";

    // Check description for explicit category in parentheses - (game), (project), (utility)
    const description = (repo.description || "").toLowerCase();

    // Look for pattern like "project name (category)"
    const categoryPattern = /\(([^)]+)\)$/; // Matches text in parentheses at the end
    const match = description.match(categoryPattern);

    if (match) {
      const categoryText = match[1].trim().toLowerCase();
      if (["game", "project", "utility"].includes(categoryText)) {
        return categoryText;
      }
    }

    // Fallback to keyword detection if no explicit category
    if (
      description.includes("game") ||
      repo.name.toLowerCase().includes("game")
    ) {
      category = "game";
    } else if (
      description.includes("utility") ||
      description.includes("tool") ||
      repo.name.toLowerCase().includes("util") ||
      repo.name.toLowerCase().includes("tool")
    ) {
      category = "utility";
    }

    return category;
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", fetchTopProjects);
})();
