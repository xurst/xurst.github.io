// Mouse-following shine effect on cards
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, looking for project cards...');
  
  // Run immediately and also after a slight delay to catch dynamically loaded cards
  setupShineEffect();
  setTimeout(setupShineEffect, 1000);
  
  function setupShineEffect() {
    const projectCards = document.querySelectorAll('.project-card');
    console.log(`Found ${projectCards.length} project cards`);
    
    if (projectCards.length === 0) {
      console.warn('No project cards found. Check your CSS class names.');
      return;
    }
    
    projectCards.forEach(card => {
      // Remove existing listeners to avoid duplicates
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      
      // Add new listeners
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      // Add debug indicator
      const debugClass = 'shine-effect-initialized';
      if (!card.classList.contains(debugClass)) {
        card.classList.add(debugClass);
      }
    });
  }
  
  function handleMouseMove(e) {
    // Get position within the card
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Position the shine effect
    this.style.setProperty('--mouse-x', `${x}px`);
    this.style.setProperty('--mouse-y', `${y}px`);
    
    // Debug output
    // console.log(`Shine at: ${x}px, ${y}px`);
  }
  
  function handleMouseLeave() {
    // Reset position when mouse leaves
    this.style.setProperty('--mouse-x', '0px');
    this.style.setProperty('--mouse-y', '0px');
  }
});