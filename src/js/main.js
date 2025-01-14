document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    const projectsGrid = document.querySelector('.projects-grid');
    const aboutSelector = document.getElementById('aboutSelector');
    const aboutContent = document.getElementById('aboutContent');
    const sortAlphaButton = document.querySelector('.sort-button:not(.sort-date)');
    const sortDateButton = document.querySelector('.sort-button.sort-date');
    let activeSort = 'alpha-asc';
    
    const GITHUB_USERNAME = 'xurst';
    const GITHUB_API_BASE = 'https://api.github.com';
    
    // About section content
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

    // Handle about section content switching
    aboutSelector.addEventListener('change', (e) => {
        aboutContent.innerHTML = aboutContentData[e.target.value];
    });

    // Initialize about content
    aboutContent.innerHTML = aboutContentData[aboutSelector.value];

    // Card hover effects
    projectCards.forEach(card => {
        const link = card.querySelector('a');
        card.addEventListener('click', (e) => {
            if (e.target !== link && link) {
                link.click();
            }
        });
    });

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
        const cards = Array.from(projectsGrid.children);
        
        cards.sort((a, b) => {
            if (byDate) {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                return activeSort === 'date-desc' ? dateA - dateB : dateB - dateA;
            } else {
                const nameA = a.getAttribute('data-name').toLowerCase();
                const nameB = b.getAttribute('data-name').toLowerCase();
                return activeSort === 'alpha-desc' 
                    ? nameB.localeCompare(nameA) 
                    : nameA.localeCompare(nameB);
            }
        });

        projectsGrid.innerHTML = '';
        cards.forEach(card => projectsGrid.appendChild(card));
    }

    async function fetchRepoData(repoName) {
        try {
            const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${repoName}:`, error);
            return null;
        }
    }

    async function updateRepoData(card, repoName) {
        const dateSpan = card.querySelector('.last-updated span');
        try {
            const data = await fetchRepoData(repoName);
            if (data && data.pushed_at) {
                const date = new Date(data.pushed_at);
                const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
                const formattedDate = `${formattedMonth} ${date.getDate()}, ${date.getFullYear()}`;
                dateSpan.textContent = `last updated: ${formattedDate}`;
                card.setAttribute('data-date', data.pushed_at);
            } else {
                throw new Error('no data available');
            }
        } catch (error) {
            const currentDate = new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).toLowerCase();
            dateSpan.textContent = `last updated: ${currentDate}`;
            card.setAttribute('data-date', new Date().toISOString());
        }
    }

    async function updateAllRepos() {
        const promises = Array.from(projectCards).map(card => {
            const repoName = card.getAttribute('data-name');
            return updateRepoData(card, repoName);
        });
        await Promise.all(promises);
        sortProjects(false);
    }

    sortAlphaButton.addEventListener('click', () => {
        activeSort = activeSort === 'alpha-asc' ? 'alpha-desc' : 'alpha-asc';
        updateSortButtons(false);
        sortProjects(false);
    });

    sortDateButton.addEventListener('click', () => {
        activeSort = activeSort === 'date-asc' ? 'date-desc' : 'date-asc';
        updateSortButtons(true);
        sortProjects(true);
    });

    updateSortButtons(false);
    updateAllRepos();
});