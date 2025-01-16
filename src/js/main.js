document.addEventListener('DOMContentLoaded', () => {
    const projectsGrid = document.querySelector('.projects-grid');
    const aboutSelector = document.getElementById('aboutSelector');
    const aboutContent = document.getElementById('aboutContent');
    const sortAlphaButton = document.querySelector('.sort-button:not(.sort-date)');
    const sortDateButton = document.querySelector('.sort-button.sort-date');
    let activeSort = 'alpha-asc';

    const GITHUB_USERNAME = 'xurst';
    const GITHUB_API_BASE = 'https://api.github.com';

    const aboutContentData = {
        who: `
            <h3>who am i</h3>
            <p>hello! i'm xurst, a computer programmer specializing in creating apps, websites, and games. most of my projects are available on github, where you can explore, star, review, fork, or even submit pull requests to my repositories. (WIP)</p>
        `,
        languages: `
            <h3>languages i'm fluent in</h3>
            <ul class="languages-list">
                <li>javascript</li>
                <li>python</li>
                <li>C#/C++</li>
                <li>html/css</li>
                <li>lua</li>
            </ul>
        `
    };

    function determineVisitType(homepage) {
        if (!homepage) return 'github (repo)';
        return homepage.includes(`${GITHUB_USERNAME}.github.io`) ? 'github' : 'external';
    }

    function createProjectCard(repo) {
        const projectUrl = repo.homepage || repo.html_url;
        const visitType = determineVisitType(repo.homepage);

        return `
            <div class="project-card" data-name="${repo.name}" data-date="${repo.pushed_at}">
                <div class="project-header">
                    <a href="${projectUrl}" target="_blank">${repo.name}</a>
                    <span class="click-indicator"><i class="fas fa-arrow-right"></i> click to visit: ${visitType}</span>
                </div>
                <p>${repo.description || 'no description available.'}</p>
                <div class="last-updated">
                    <i class="fas fa-history"></i>
                    <span>last updated: ${formatDate(repo.pushed_at)}</span>
                </div>
            </div>
        `;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toLowerCase();
    }

    async function fetchRepos() {
        try {
            const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos`);
            if (!response.ok) throw new Error('failed to fetch repo');

            const repos = await response.json();

            const repoDetailsPromises = repos
                .filter(repo => !repo.fork && repo.name !== 'xurst.github.io')
                .map(async repo => {
                    try {
                        const detailResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repo.name}`);
                        if (!detailResponse.ok) return repo;

                        const details = await detailResponse.json();
                        return {
                            ...repo,
                            homepage: details.homepage
                        };
                    } catch (error) {
                        console.error(`error fetching details for ${repo.name}:`, error);
                        return repo;
                    }
                });

            const reposWithDetails = await Promise.all(repoDetailsPromises);

            projectsGrid.innerHTML = '';
            reposWithDetails.forEach(repo => {
                projectsGrid.innerHTML += createProjectCard(repo);
            });

            addCardClickHandlers();
            sortProjects(false);
        } catch (error) {
            console.error('error fetching repos:', error);
            projectsGrid.innerHTML = '<div class="error-message">failed to load repositories. try refreshing or try again later.</div>';
        }
    }

    function addCardClickHandlers() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            const link = card.querySelector('a');
            card.addEventListener('click', (e) => {
                if (e.target !== link && link) {
                    link.click();
                }
            });
        });
    }

    function updateSortButtons(isDateSort) {
        if (isDateSort) {
            sortDateButton.classList.add('active');
            sortAlphaButton.classList.remove('active');
            sortDateButton.querySelector('i').className = activeSort === 'date-desc'
                ? 'fas fa-calendar-alt fa-rotate-180'
                : 'fas fa-calendar-alt';
            sortAlphaButton.querySelector('i').className = 'fas fa-sort-alpha-down';
        } else {
            sortAlphaButton.classList.add('active');
            sortDateButton.classList.remove('active');
            sortAlphaButton.querySelector('i').className = activeSort === 'alpha-desc'
                ? 'fas fa-sort-alpha-up'
                : 'fas fa-sort-alpha-down';
            sortDateButton.querySelector('i').className = 'fas fa-calendar-alt';
        }
    }

    function sortProjects(byDate = false) {
        const fragment = document.createDocumentFragment();
        const cards = Array.from(projectsGrid.children);

        cards.sort((a, b) => {
            if (byDate) {
                const dateA = new Date(a.dataset.date);
                const dateB = new Date(b.dataset.date);
                return activeSort === 'date-desc' ? dateB - dateA : dateA - dateB;
            } else {
                const nameA = a.dataset.name.toLowerCase();
                const nameB = b.dataset.name.toLowerCase();
                return activeSort === 'alpha-desc'
                    ? nameB.localeCompare(nameA)
                    : nameA.localeCompare(nameB);
            }
        });

        cards.forEach(card => fragment.appendChild(card));
        requestAnimationFrame(() => {
            projectsGrid.innerHTML = '';
            projectsGrid.appendChild(fragment);
        });
    }

    aboutSelector.addEventListener('change', (e) => {
        aboutContent.innerHTML = aboutContentData[e.target.value];
    });

    let sortTimeout;
    sortAlphaButton.addEventListener('click', () => {
        if (sortTimeout) clearTimeout(sortTimeout);
        activeSort = activeSort === 'alpha-asc' ? 'alpha-desc' : 'alpha-asc';
        updateSortButtons(false);
        sortTimeout = setTimeout(() => {
            sortProjects(false);
        }, 0);
    });
    sortDateButton.addEventListener('click', () => {
        if (sortTimeout) clearTimeout(sortTimeout);
        activeSort = activeSort === 'date-asc' ? 'date-desc' : 'date-asc';
        updateSortButtons(true);
        sortTimeout = setTimeout(() => {
            sortProjects(true);
        }, 0);
    });

    aboutContent.innerHTML = aboutContentData[aboutSelector.value];
    updateSortButtons(false);
    fetchRepos();
});