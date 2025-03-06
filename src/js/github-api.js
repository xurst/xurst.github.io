// github-api.js - Centralized GitHub API handling with token support

(function() {
  const GITHUB_USERNAME = 'xurst';
  const GITHUB_API_BASE = 'https://api.github.com';
  
  // Function to get GitHub token with multiple fallback options
  async function getGithubToken() {
    // Try to get from localStorage first (if previously stored)
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) return storedToken;

    // Check URL parameters (useful for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('github_token');
    if (urlToken) {
      localStorage.setItem('github_token', urlToken);
      console.log('GitHub token loaded from URL parameter');
      return urlToken;
    }
    
    // Hardcoded token option - enable this for development
    const hardcodedToken = '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';
    if (hardcodedToken) {
      localStorage.setItem('github_token', hardcodedToken);
      console.log('Using hardcoded GitHub token');
      return hardcodedToken;
    }
    
    console.warn('Unable to load GitHub token');
    return null;
  }
  
  // Create fetch headers with token if available
  async function createHeaders() {
    const headers = new Headers({
      'Accept': 'application/vnd.github.v3+json'
    });
    
    const token = await getGithubToken();
    if (token) {
      headers.append('Authorization', `token ${token}`);
    } else {
      console.warn('No GitHub token found. API requests may be rate-limited.');
    }
    
    return headers;
  }
  
  // Centralized fetch function with error handling and rate limit detection
  async function fetchFromGitHub(endpoint, options = {}) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${GITHUB_API_BASE}${endpoint}`;
    
    const headers = await createHeaders();
    const requestOptions = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, requestOptions);
      
      // Log rate limit information for debugging
      const rateLimit = {
        limit: response.headers.get('X-RateLimit-Limit'),
        remaining: response.headers.get('X-RateLimit-Remaining'),
        reset: response.headers.get('X-RateLimit-Reset')
      };
      
      if (rateLimit.remaining && parseInt(rateLimit.remaining) < 10) {
        console.warn(`GitHub API rate limit warning: ${rateLimit.remaining} requests remaining`);
      }
      
      if (!response.ok) {
        if (rateLimit.remaining === '0') {
          const resetDate = new Date(parseInt(rateLimit.reset) * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
        }
        throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }
  
  // Helper function to retry failed requests with exponential backoff
  async function fetchWithRetry(endpoint, options = {}, maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await fetchFromGitHub(endpoint, options);
      } catch (error) {
        retries++;
        
        // If we've reached max retries or it's not a rate limit error, don't retry
        if (retries >= maxRetries || !error.message.includes('rate limit')) {
          throw error;
        }
        
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Expose functions to global context
  window.GitHubAPI = {
    username: GITHUB_USERNAME,
    fetchFromGitHub,
    fetchWithRetry,
    getUserRepos: () => fetchWithRetry(`/users/${GITHUB_USERNAME}/repos`),
    getRepoDetails: (repoName) => fetchWithRetry(`/repos/${GITHUB_USERNAME}/${repoName}`),
    getRepoLanguages: (repoName) => fetchWithRetry(`/repos/${GITHUB_USERNAME}/${repoName}/languages`),
    hasToken: async () => !!(await getGithubToken()),
    // Add a clear cache method for debugging
    clearTokenCache: () => {
      localStorage.removeItem('github_token');
      console.log('GitHub token cache cleared');
    }
  };
})();