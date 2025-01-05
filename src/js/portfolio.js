// src/js/portfolio.js
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const link = card.querySelector('a');

        // Handle hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.borderColor = 'white';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.borderColor = '#3c3c3c';
        });

        // Handle card clicks
        card.addEventListener('click', (e) => {
            // Only trigger if we didn't click the link directly
            if (e.target !== link && link) {
                link.click();
            }
        });
    });
});