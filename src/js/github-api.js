(function() {
  const GITHUB_USERNAME = 'xurst';
  
  // Dynamic URL detection
  const getCurrentOrigin = () => {
    return window.location.origin; // Gets current site URL (works with any IP/domain)
  };
  
  // Choose API URL based on environment
  const getApiBaseUrl = () => {
    const currentOrigin = getCurrentOrigin();
    
    // Development environments (local)
    if (currentOrigin.includes('localhost') || 
        currentOrigin.includes('127.0.0.1') ||
        currentOrigin.includes('10.0.0.72') ||
        /^http:\/\/\d+\.\d+\.\d+\.\d+/.test(currentOrigin)) {
      // If running locally, use the production API
      return 'https://portfolio-backend-8t32.onrender.com/api';
    }
    
    // Production (GitHub Pages)
    return 'https://portfolio-backend-8t32.onrender.com/api';
  };
  
  const API_BASE_URL = getApiBaseUrl();
  console.log(`Using API URL: ${API_BASE_URL}`);
  
  async function fetchFromAPI(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }
  
  async function fetchWithRetry(endpoint, options = {}, maxRetries = 2) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await fetchFromAPI(endpoint, options);
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retrying in ${delay}ms... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  async function getRepoLanguages(repoName) {
    return fetchWithRetry(`/repos/${repoName}/languages`);
  }
  
  async function getFeaturedRepos() {
    return fetchWithRetry('/featured');
  }
  
  window.GitHubAPI = {
    username: GITHUB_USERNAME,
    fetchFromAPI,
    fetchWithRetry,
    getUserRepos: () => fetchWithRetry('/user/repos'),
    getRepoDetails: (repoName) => fetchWithRetry(`/repos/${repoName}`),
    getRepoLanguages,
    getFeaturedRepos,
    clearCache: () => fetchFromAPI('/clear-cache', { method: 'POST' })
  };
})();