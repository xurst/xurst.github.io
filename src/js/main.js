document.addEventListener("DOMContentLoaded", () => {
  const projectsGrid = document.querySelector(".projects-grid");
  const aboutSelector = document.getElementById("aboutSelector");
  const aboutContent = document.getElementById("aboutContent");
  const sortAlphaButton = document.querySelector(
    ".sort-button:not(.sort-date)"
  );
  const sortDateButton = document.querySelector(".sort-button.sort-date");
  const projectSearch = document.getElementById("project-search");
  const categoryFilter = document.getElementById("category-filter");
  const typeFilter = document.getElementById("type-filter");
  let activeSort = "alpha-asc";
  let activeFilter = "all";
  let activeTypeFilter = "all";
  let alphaBtnAnimating = false;
  let dateBtnAnimating = false;

  const socialDropdownToggle = document.querySelector('.social-dropdown-toggle');
  const socialDropdown = document.querySelector('.social-dropdown');
  
  if (socialDropdownToggle && socialDropdown) {
    socialDropdownToggle.addEventListener('click', () => {
      socialDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
      if (!socialDropdown.contains(e.target)) {
        socialDropdown.classList.remove('active');
      }
    });
  }

  const GITHUB_USERNAME = "xurst";

  const aboutContentData = {
    who: `
<h3>WHO AM I</h3>
<p>hello! i'm xurst, a computer programmer specializing in creating apps, websites, and games. most of my projects are available on github, where you can explore, star, review, fork, or even submit pull requests to my repositories.</p>
<div class="divider-2"></div>
<p>i'm currently working on several new projects and continuously improving my skills in different programming languages.</p>
        `,
    languages: `
            <h3>PROGRAMMING LANGUAGES IM GOOD AT</h3>
            <div class="skills-grid">
                <div class="skill-item">
                    <i class="fab fa-js"></i>
                    <span>javascript</span>
                </div>
                <div class="skill-item">
                    <i class="fab fa-python"></i>
                    <span>python</span>
                </div>
                <div class="skill-item">
                    <i class="fas fa-code"></i>
                    <span>C/C++/C#</span>
                </div>
                <div class="skill-item">
                    <i class="fab fa-html5"></i>
                    <span>html/css</span>
                </div>
                <div class="skill-item">
                    <i class="fas fa-moon"></i>
                    <span>lua</span>
                </div>
                <div class="skill-item">
                    <i class="fas fa-fire"></i>
                    <span>svelte</span>
                </div>
                <div class="skill-item">
                    <i class="fab fa-react"></i>
                    <span>react.js</span>
                </div>
                <div class="skill-item">
                    <i class="fab fa-node-js"></i>
                    <span>node.js</span>
                </div>
            </div>
        `,
  };

  function determineVisitType(homepage) {
    if (!homepage) return "github (repo)";
    return homepage.includes(`${GITHUB_USERNAME}.github.io`)
      ? "website"
      : "github (repo)";
  }

  async function getLanguages(repo) {
    try {
      return await GitHubAPI.getRepoLanguages(repo.name);
    } catch (error) {
      console.error(`Error fetching languages for ${repo.name}:`, error);
      return null;
    }
  }

  function formatLanguages(languages) {
    if (!languages || Object.keys(languages).length === 0) return "";

    const sortedLangs = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0].toLowerCase());

    const topLangs = sortedLangs.slice(0, 3);

    if (topLangs.length === 0) return "";

    let langText = "";
    if (topLangs.length === 1) {
      langText = topLangs[0];
    } else if (topLangs.length === 2) {
      langText = `${topLangs[0]} & ${topLangs[1]}`;
    } else if (topLangs.length === 3) {
      langText = `${topLangs[0]}, ${topLangs[1]}, & ${topLangs[2]}`;
    }

    return `
            <div class="project-languages">
                <i class="fas fa-code"></i>
                <span>coded in ${langText}</span>
            </div>
        `;
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

  async function createProjectCard(repo, index) {
    const projectUrl = repo.homepage || repo.html_url;
    const visitType = determineVisitType(repo.homepage);
    const languages = await getLanguages(repo);
    const languagesHtml = formatLanguages(languages);
    const category = getProjectCategory(repo);
    const projectType = visitType.includes("website") ? "website" : "repo";
    
    // Alternate between different fade directions based on index
    const fadeDirections = ['fade-up', 'fade-left', 'fade-right'];
    const fadeDirection = fadeDirections[index % fadeDirections.length];
    
    // Add delay variations
    const delayClasses = ['', 'fade-delay-100', 'fade-delay-300'];
    const delayClass = delayClasses[index % delayClasses.length];

    let description = repo.description || "no description available.";
    description = description.replace(/\s*\([^)]*\)\s*$/, "");
    
    let clickIndicatorText = "click card: site | click title: repo";
    if (projectType === "repo") {
      clickIndicatorText = "click card: repo | click title: yes";
    }

    return `
            <div class="project-card fade ${fadeDirection} ${delayClass}" data-name="${repo.name}" data-date="${
      repo.pushed_at
    }" data-category="${category}" data-type="${projectType}">
                <div class="project-header">
                    <a href="${projectUrl}" target="_blank" data-repo-url="${repo.html_url}">
                      <span class="project-title-text">${repo.name}</span>
                      <span class="github-icon"><i class="fab fa-github"></i> go to repo</span>
                    </a>
                    <div class="project-tags">
                        <span class="project-category ${category}">${category}</span>
                        <span class="project-category ${projectType}">${projectType}</span>
                    </div>
                    <span class="click-indicator"><i class="fas fa-arrow-right"></i> ${clickIndicatorText}</span>
                </div>
                <p>${description}</p>
                <div class="last-updated">
                    <i class="fas fa-history"></i>
                    <span>last updated: ${formatDate(repo.pushed_at)}</span>
                </div>
                ${languagesHtml}
<div class="project-languages stars-info">
    <i class="fas fa-star"></i>
    <span>${
      repo.stargazers_count === 1 ? "1 star" : `${repo.stargazers_count} stars`
    }</span>
</div>
            </div>
        `;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toLowerCase();
  }

  async function fetchRepos() {
    try {
      projectsGrid.innerHTML = '<div class="loading">loading projects...</div>';

      const repos = await GitHubAPI.getUserRepos();

      const repoDetailsPromises = repos
        .filter((repo) => !repo.fork && repo.name !== "xurst.github.io")
        .map(async (repo) => {
          try {
            const details = await GitHubAPI.getRepoDetails(repo.name);
            return {
              ...repo,
              homepage: details.homepage,
            };
          } catch (error) {
            console.error(`error fetching details for ${repo.name}:`, error);
            return repo;
          }
        });

      const reposWithDetails = await Promise.all(repoDetailsPromises);

      const projectCards = [];
      for (let i = 0; i < reposWithDetails.length; i++) {
        const card = await createProjectCard(reposWithDetails[i], i);
        projectCards.push(card);
      }

      projectsGrid.innerHTML = "";
      projectCards.forEach((cardHtml) => {
        projectsGrid.innerHTML += cardHtml;
      });

      addCardClickHandlers();
      sortProjects(false);
      
      // Refresh scroll fade to observe new elements
      if (window.scrollFade) {
        window.scrollFade.refreshElements();
      }
    } catch (error) {
      console.error("error fetching repos:", error);
      projectsGrid.innerHTML =
        '<div class="error-message">failed to load repositories. try refreshing the page or try again later.</div>';
    }
  }

  function addCardClickHandlers() {
    const projectCards = document.querySelectorAll(".project-card");
    projectCards.forEach((card) => {
      const link = card.querySelector("a");
      card.addEventListener("click", (e) => {
        // Only trigger if the click was not on the link itself or any of its children
        if (!e.target.closest('a') && link) {
          link.click();
        }
      });
    });
  }

  function updateSortButtons(isDateSort) {
    if (isDateSort) {
      sortDateButton.classList.add("active");
      sortAlphaButton.classList.remove("active");
      sortDateButton.querySelector("i").className =
        activeSort === "date-desc"
          ? "fas fa-sort-amount-down"
          : "fas fa-sort-amount-up";
      sortAlphaButton.querySelector("i").className = "fas fa-sort-alpha-down";
    } else {
      sortAlphaButton.classList.add("active");
      sortDateButton.classList.remove("active");
      sortAlphaButton.querySelector("i").className =
        activeSort === "alpha-desc"
          ? "fas fa-sort-alpha-up"
          : "fas fa-sort-alpha-down";
      sortDateButton.querySelector("i").className = "fas fa-sort-amount-up";
    }
  }

  function filterProjects() {
    const searchTerm = projectSearch.value.toLowerCase();
    const cards = Array.from(projectsGrid.children);

    cards.forEach((card) => {
      if (
        card.classList.contains("error-message") ||
        card.classList.contains("loading")
      ) {
        return;
      }

      const projectName = card.dataset.name.toLowerCase();
      const projectCategory = card.dataset.category;
      const projectType = card.dataset.type;
      const projectDescription = card
        .querySelector("p")
        .textContent.toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        projectName.includes(searchTerm) ||
        projectDescription.includes(searchTerm);

      const matchesCategory =
        activeFilter === "all" || projectCategory === activeFilter;

      const matchesType =
        activeTypeFilter === "all" || projectType === activeTypeFilter;

      if (matchesSearch && matchesCategory && matchesType) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  function sortProjects(byDate = false) {
    const fragment = document.createDocumentFragment();
    const cards = Array.from(projectsGrid.children);

    cards.sort((a, b) => {
      if (byDate) {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);
        return activeSort === "date-desc" ? dateB - dateA : dateA - dateB;
      } else {
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();
        return activeSort === "alpha-desc"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }
    });

    cards.forEach((card) => fragment.appendChild(card));
    requestAnimationFrame(() => {
      projectsGrid.innerHTML = "";
      projectsGrid.appendChild(fragment);
    });

    filterProjects();
  }

  aboutContent.innerHTML = `
    <div class="content-wrapper">${aboutContentData[aboutSelector.value]}</div>
    <div class="swipe-transition"></div>
  `;

  // Track the current active tab to determine direction
  let currentTab = 'who';

  aboutSelector.addEventListener("change", (e) => {
    const contentWrapper = aboutContent.querySelector('.content-wrapper');
    if (!contentWrapper) {
      console.error('Content wrapper not found, reinitializing');
      aboutContent.innerHTML = `
        <div class="content-wrapper"></div>
        <div class="swipe-transition"></div>
      `;
    }
    
    // Determine the transition direction based on current and new tab
    const newTab = e.target.value;
    const direction = (currentTab === 'who' && newTab === 'languages') ? 'right-to-left' : 'left-to-right';
    
    // Update current tab for next transition
    currentTab = newTab;
    
    // Ensure the transition element is visible
    const swipeTransition = aboutContent.querySelector('.swipe-transition') || document.createElement('div');
    if (!aboutContent.querySelector('.swipe-transition')) {
      swipeTransition.className = 'swipe-transition';
      aboutContent.appendChild(swipeTransition);
    }
    
    // Remove any existing direction classes
    aboutContent.classList.remove('swipe-right-to-left', 'swipe-left-to-right');
    
    // Force a reflow to ensure CSS transitions work properly
    void aboutContent.offsetWidth;
    
    // Add the appropriate direction class
    aboutContent.classList.add(`swipe-${direction}`);
    
    // Create the transition
    setTimeout(() => {
      // Change content when the transition is halfway through
      const newWrapper = aboutContent.querySelector('.content-wrapper');
      if (newWrapper) {
        newWrapper.innerHTML = aboutContentData[newTab];
      } else {
        aboutContent.innerHTML = `
          <div class="content-wrapper">${aboutContentData[newTab]}</div>
          <div class="swipe-transition"></div>
        `;
      }
      
      // Remove the transition class after animation completes
      setTimeout(() => {
        aboutContent.classList.remove(`swipe-${direction}`);
      }, 550); // Match this to the full CSS transition duration
    }, 250); // Time before content changes (about halfway through the transition)
  });

  let sortTimeout;
  sortAlphaButton.addEventListener("click", () => {
    if (sortTimeout) clearTimeout(sortTimeout);
    
    // Only animate if not already animating
    if (!alphaBtnAnimating) {
      alphaBtnAnimating = true;
      
      // Add animation class
      sortAlphaButton.classList.add('sort-button-animate');
      
      // Remove animation class and reset flag when animation completes
      setTimeout(() => {
        sortAlphaButton.classList.remove('sort-button-animate');
        alphaBtnAnimating = false;
      }, 400);
      
      activeSort = activeSort === "alpha-asc" ? "alpha-desc" : "alpha-asc";
      updateSortButtons(false);
      sortTimeout = setTimeout(() => {
        sortProjects(false);
      }, 0);
    }
  });
  sortDateButton.addEventListener("click", () => {
    if (sortTimeout) clearTimeout(sortTimeout);
    
    // Only animate if not already animating
    if (!dateBtnAnimating) {
      dateBtnAnimating = true;
      
      // Add animation class
      sortDateButton.classList.add('sort-button-animate');
      
      // Remove animation class and reset flag when animation completes
      setTimeout(() => {
        sortDateButton.classList.remove('sort-button-animate');
        dateBtnAnimating = false;
      }, 400);
      
      activeSort = activeSort === "date-asc" ? "date-desc" : "date-asc";
      updateSortButtons(true);
      sortTimeout = setTimeout(() => {
        sortProjects(true);
      }, 0);
    }
  });

  projectSearch.addEventListener("input", filterProjects);
  categoryFilter.addEventListener("change", (e) => {
    activeFilter = e.target.value;
    filterProjects();
  });
  typeFilter.addEventListener("change", (e) => {
    activeTypeFilter = e.target.value;
    filterProjects();
  });

  aboutContent.innerHTML = aboutContentData[aboutSelector.value];
  updateSortButtons(false);
  fetchRepos();
});