function parseDate(dateStr) {
    if (dateStr.includes('unavailable')) return new Date(0);
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const [month, day, year] = dateStr.split(' ');
    return new Date(year, months[month], parseInt(day));
}

export function initializeSorting(projectsGrid) {
    const sortAlphaButton = document.querySelector('.sort-button:not(.sort-date)');
    const sortDateButton = document.querySelector('.sort-button.sort-date');
    let activeSort = 'alpha-asc';

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
    return { sortProjects };
}