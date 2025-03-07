(function() {
  // Create the theme toggle button
  const themeToggle = document.createElement('div');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = `
    <i class="fas fa-sun light-icon"></i>
    <i class="fas fa-moon dark-icon"></i>
  `;
  document.body.appendChild(themeToggle);

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  
  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Save theme preference
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
  });
})();