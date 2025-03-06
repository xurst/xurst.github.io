(function() {
  const profilePic = document.getElementById('profile-pic');
  
  if (!profilePic) return;
  
  // Add fun animation when clicking the profile picture
  let clickCount = 0;
  const animations = [
    'rotate(360deg) scale(1.2)',
    'rotate(-360deg) scale(0.8)',
    'skew(10deg, 10deg)',
    'translateY(-20px) scale(1.1)'
  ];
  
  // Cool glasses overlay
  const addGlasses = () => {
    // Check if glasses already exist
    if (document.getElementById('profile-glasses')) return;
    
    const glasses = document.createElement('div');
    glasses.id = 'profile-glasses';
    glasses.className = 'profile-glasses';
    
    // Position the glasses relative to the profile pic
    const rect = profilePic.getBoundingClientRect();
    const parent = profilePic.parentElement;
    parent.style.position = 'relative';
    
    // Add the glasses HTML
    glasses.innerHTML = `
      <svg width="150" height="50" viewBox="0 0 150 50">
        <path d="M30,25 C30,17 35,10 45,10 C55,10 60,17 60,25 C60,33 55,40 45,40 C35,40 30,33 30,25 Z" 
              fill="none" stroke="white" stroke-width="3"/>
        <path d="M90,25 C90,17 95,10 105,10 C115,10 120,17 120,25 C120,33 115,40 105,40 C95,40 90,33 90,25 Z" 
              fill="none" stroke="white" stroke-width="3"/>
        <path d="M60,25 L90,25" stroke="white" stroke-width="3"/>
        <path d="M15,20 L30,25" stroke="white" stroke-width="3"/>
        <path d="M120,25 L135,20" stroke="white" stroke-width="3"/>
      </svg>
    `;
    
    // Style the glasses
    glasses.style.position = 'absolute';
    glasses.style.top = '40%';
    glasses.style.left = '50%';
    glasses.style.transform = 'translate(-50%, -50%)';
    glasses.style.zIndex = '2';
    glasses.style.opacity = '0';
    glasses.style.transition = 'opacity 0.5s ease';
    
    // Add to the DOM
    parent.appendChild(glasses);
    
    // Animate in
    setTimeout(() => {
      glasses.style.opacity = '1';
    }, 50);
    
    // Remove after delay
    setTimeout(() => {
      glasses.style.opacity = '0';
      setTimeout(() => {
        if (glasses.parentElement) {
          glasses.parentElement.removeChild(glasses);
        }
      }, 500);
    }, 3000);
  };
  
  profilePic.addEventListener('click', () => {
    // Play a different animation each click
    const animation = animations[clickCount % animations.length];
    
    // Apply animation
    profilePic.style.transition = 'transform 0.5s ease';
    profilePic.style.transform = animation;
    
    // After 4 clicks, add the glasses
    if (clickCount === 3) {
      addGlasses();
    }
    
    // Reset after animation completes
    setTimeout(() => {
      profilePic.style.transform = '';
    }, 500);
    
    clickCount++;
  });
  
  // Add hover effect
  profilePic.addEventListener('mouseover', () => {
    profilePic.style.transition = 'transform 0.3s ease';
    profilePic.style.transform = 'scale(1.05)';
  });
  
  profilePic.addEventListener('mouseout', () => {
    profilePic.style.transform = '';
  });
})();