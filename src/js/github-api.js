(function() {
  const GITHUB_USERNAME = 'xurst';
  // const API_BASE_URL = 'http://localhost:5504/api'; // Development
  const API_BASE_URL = 'https://portfolio-backend-8t32.onrender.com/api'; // Production
  
  // For development/testing only - will be removed in production
  const isBrowserEnvironment = typeof window !== 'undefined';
  const isDevEnvironment = isBrowserEnvironment && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Use the appropriate API URL based on environment
  const apiBaseUrl = isDevEnvironment 
    ? 'http://localhost:5504/api' 
    : 'https://portfolio-backend-8t32.onrender.com/api';
  
  async function fetchFromAPI(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
    
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