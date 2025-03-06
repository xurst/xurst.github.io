(function() {
  const profilePic = document.getElementById('profile-pic');
  
  if (!profilePic) return;
  
  let clickCount = 0;
  let imageReplaced = false;
  
  const originalSrc = profilePic.src;
  
  const getAlternateSrc = () => {
    const pathParts = originalSrc.split('/');
    const filename = pathParts.pop();
    
    const baseName = filename.substring(0, filename.lastIndexOf('.'));
    const extension = filename.substring(filename.lastIndexOf('.'));
    
    return pathParts.join('/') + '/' + baseName + '_cool' + extension;
  };
  
  // Click handler for profile pic
  profilePic.addEventListener('click', () => {
    clickCount++;
    
    if (clickCount >= 3 && !imageReplaced) {
      profilePic.src = getAlternateSrc();
      imageReplaced = true;
    }
  });
})();