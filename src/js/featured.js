(function () {
  const featuredGrid = document.querySelector(".featured-grid");

  async function fetchTopProjects() {
    try {
      featuredGrid.innerHTML =
        '<div class="featured-placeholder">loading featured projects...</div>';

      const topRepos = await GitHubAPI.getFeaturedRepos();
      
      const filteredRepos = topRepos.filter(repo => repo.name !== "xurst.github.io");

      if (filteredRepos.length === 0) {
        featuredGrid.innerHTML =
          '<div class="featured-placeholder">no featured projects available</div>';
        return;
      }

      const projectCards = [];
      for (const repo of filteredRepos) {
        try {
          const details = await GitHubAPI.getRepoDetails(repo.name);
          const fullRepo = { ...repo, homepage: details.homepage };

          const projectUrl = fullRepo.homepage || fullRepo.html_url;
          const visitType = fullRepo.homepage ? "website" : "repo";
          const languages = await GitHubAPI.getRepoLanguages(repo.name);
          const category = getProjectCategory(fullRepo);

          let description = fullRepo.description || "no description available";
          description = description.replace(/\s*\([^)]*\)\s*$/, "");

          let languagesHtml = "";
          if (languages && Object.keys(languages).length > 0) {
            const sortedLangs = Object.entries(languages)
              .sort((a, b) => b[1] - a[1])
              .map((entry) => entry[0].toLowerCase());

            const topLangs = sortedLangs.slice(0, 3);

            if (topLangs.length > 0) {
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

          const rank = topRepos.indexOf(repo) + 1;

          const fadeDirections = ['fade-up', 'fade-left', 'fade-right', 'fade-up-right'];
          const fadeDirection = fadeDirections[topRepos.indexOf(repo) % fadeDirections.length];
          
          const delayClasses = ['', 'fade-delay-100', 'fade-delay-300', 'fade-delay-500'];
          const delayClass = delayClasses[topRepos.indexOf(repo) % delayClasses.length];
          
          const card = `
            <div class="project-card featured-project fade ${fadeDirection} ${delayClass}" data-name="${
              fullRepo.name
            }" data-date="${
            fullRepo.pushed_at
          }" data-category="${category}" data-type="${visitType}">
              <div class="featured-badge">featured</div>
              <div class="project-header">
                <a href="${projectUrl}" target="_blank" data-repo-url="${fullRepo.html_url}">
                  <span class="project-title-text">${fullRepo.name}</span>
                  <span class="github-icon"><i class="fab fa-github"></i> view repo</span>
                </a>
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

      featuredGrid.innerHTML = "";

      projectCards.forEach((cardHtml) => {
        featuredGrid.innerHTML += cardHtml;
      });

      // Add click handlers to featured cards
      document.querySelectorAll(".featured-project").forEach((card) => {
        // Only add click handler
        const link = card.querySelector("a");
        card.addEventListener("click", (e) => {
          // Only trigger if the click was not on the link itself or any of its children
          if (!e.target.closest('a') && link) {
            link.click();
          }
        });
      });

      // Refresh the scrollFade to observe the new elements
      if (window.scrollFade) {
        window.scrollFade.refreshElements();
      }
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      featuredGrid.innerHTML =
        '<div class="featured-placeholder">failed to load featured projects. try refreshing the page or try again later.</div>';
    }
  }

  function getProjectCategory(repo) {
    let category = "project";

    const description = (repo.description || "").toLowerCase();

    const categoryPattern = /\(([^)]+)\)$/;
    const match = description.match(categoryPattern);

    if (match) {
      const categoryText = match[1].trim().toLowerCase();
      if (["game", "project", "utility"].includes(categoryText)) {
        return categoryText;
      }
    }

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

  document.addEventListener("DOMContentLoaded", fetchTopProjects);
})();