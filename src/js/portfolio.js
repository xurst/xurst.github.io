document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    const sortAlphaButton = document.querySelector('.sort-button:not(.sort-date)');
    const sortDateButton = document.querySelector('.sort-button.sort-date');
    const projectsGrid = document.querySelector('.projects-grid');
    let activeSort = 'alpha-asc';
    const GITHUB_USERNAME = 'xurst';
    const GITHUB_API_BASE = 'https://api.github.com';
    
    // stealing methods is so insane!!!

    /**
     * Formats a date string in the required format (e.g., "Jan 6, 2025")
     * @param {string} dateString - ISO date string from GitHub API
     * @returns {string} Formatted date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    /**
     * Fetches repository data from GitHub API
     * @param {string} repoName - Repository name
     * @returns {Promise<Object>} Repository data
     */
    async function fetchRepoData(repoName) {
        try {
            const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data for ${repoName}:`, error);
            return null;
        }
    }

    /**
     * Updates the last updated date for a project card
     * @param {HTMLElement} card - Project card element
     * @param {string} repoName - Repository name
     */
    async function updateLastUpdated(card, repoName) {
        const dateElement = card.querySelector('.last-updated span');
        const loadingText = 'updating...';
        dateElement.textContent = loadingText;

        try {
            const repoData = await fetchRepoData(repoName);
            if (repoData && repoData.pushed_at) {
                const formattedDate = formatDate(repoData.pushed_at);
                dateElement.textContent = `last updated: ${formattedDate}`;
                card.dataset.date = repoData.pushed_at; // Update data attribute for sorting
            } else {
                throw new Error('No repository data available');
            }
        } catch (error) {
            console.error(`Error updating date for ${repoName}:`, error);
            dateElement.textContent = 'last updated: unavailable';
        }
    }

    /**
     * Updates all project cards with latest GitHub data
     */
    async function updateAllProjects() {
        const updatePromises = Array.from(projectCards).map(card => {
            const repoName = card.dataset.name;
            return updateLastUpdated(card, repoName);
        });

        await Promise.all(updatePromises);
        sortProjects(false); // Re-sort after updating dates
    }

    projectCards.forEach(card => {
        const link = card.querySelector('a');

        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.border = '2px solid rgba(60, 60, 60, 0.5)';
        });

        card.addEventListener('click', (e) => {
            if (e.target !== link && link) {
                link.click();
            }
        });
    });

    function parseDate(dateStr) {
        if (dateStr.includes('unavailable')) return new Date(0);
        const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const [month, day, year] = dateStr.split(' ');
        return new Date(year, months[month], parseInt(day));
    }

    function updateSortButtons(isDateSort) {
        if (isDateSort) {
            sortDateButton.classList.add('active');
            sortAlphaButton.classList.remove('active');
            sortDateButton.querySelector('i').className = activeSort === 'date-desc'
                ? 'fas fa-clock fa-rotate-180'
                : 'fas fa-clock';
            sortAlphaButton.querySelector('i').className = 'fas fa-sort-alpha-down';
        } else {
            sortAlphaButton.classList.add('active');
            sortDateButton.classList.remove('active');
            sortAlphaButton.querySelector('i').className = activeSort === 'alpha-desc'
                ? 'fas fa-sort-alpha-up'
                : 'fas fa-sort-alpha-down';
            sortDateButton.querySelector('i').className = 'fas fa-clock';
        }
    }

    function sortProjects(byDate = false) {
        const cards = Array.from(projectsGrid.children);

        cards.sort((a, b) => {
            if (byDate) {
                const dateA = parseDate(a.querySelector('.last-updated span').textContent.replace('last updated: ', ''));
                const dateB = parseDate(b.querySelector('.last-updated span').textContent.replace('last updated: ', ''));
                return activeSort === 'date-desc' ? dateB - dateA : dateA - dateB;
            } else {
                const nameA = a.dataset.name.toLowerCase();
                const nameB = b.dataset.name.toLowerCase();
                return activeSort === 'alpha-desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
            }
        });

        projectsGrid.innerHTML = '';
        cards.forEach(card => projectsGrid.appendChild(card));
    }

    sortAlphaButton.addEventListener('click', () => {
        if (activeSort === 'alpha-asc') {
            activeSort = 'alpha-desc';
        } else {
            activeSort = 'alpha-asc';
        }
        updateSortButtons(false);
        sortProjects(false);
    });

    sortDateButton.addEventListener('click', () => {
        if (activeSort === 'date-asc') {
            activeSort = 'date-desc';
        } else {
            activeSort = 'date-asc';
        }
        updateSortButtons(true);
        sortProjects(true);
    });

    updateSortButtons(false);
    updateAllProjects();
});