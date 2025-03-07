(function() {
  const GITHUB_USERNAME = 'xurst';
  const GITHUB_API_BASE = 'https://api.github.com';
  
  const cache = {
    set: function(key, data, ttl = 3600000) {
      const item = {
        data: data,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(`gh_cache_${key}`, JSON.stringify(item));
    },
    get: function(key) {
      const item = localStorage.getItem(`gh_cache_${key}`);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item);
      if (Date.now() > parsedItem.expiry) {
        localStorage.removeItem(`gh_cache_${key}`);
        return null;
      }
      
      return parsedItem.data;
    },
    clear: function() {
      Object.keys(localStorage)
        .filter(key => key.startsWith('gh_cache_'))
        .forEach(key => localStorage.removeItem(key));
    }
  };
  
  async function loadLocalData(file) {
    try {
      const response = await fetch(`/data/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${file}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Local data file (${file}) not found or invalid, falling back to API`);
      return null;
    }
  }
  
  async function fetchFromGitHub(endpoint, options = {}) {
    if (endpoint === `/users/${GITHUB_USERNAME}/repos`) {
      const localData = await loadLocalData('repositories.json');
      if (localData) {
        console.log('Using local repositories data');
        return localData;
      }
    } else if (endpoint.includes('/languages')) {
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
    const cacheKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for ${endpoint}`);
      return cachedData;
    }
    
    const headers = new Headers({
      'Accept': 'application/vnd.github.v3+json'
    });
    
    const requestOptions = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining === '0') {
          const resetTime = new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`);
        }
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }
  
  async function fetchWithRetry(endpoint, options = {}, maxRetries = 2) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await fetchFromGitHub(endpoint, options);
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
    try {
      const repos = await loadLocalData('repositories.json');
      if (repos) {
        const repo = repos.find(r => r.name === repoName);
        if (repo && repo.languages) {
          console.log(`Using local language data for ${repoName}`);
          return repo.languages;
        }
      }
    } catch (error) {
      console.warn('Error loading local language data, falling back to API');
    }
    
    return fetchWithRetry(`/repos/${GITHUB_USERNAME}/${repoName}/languages`);
  }
  
  async function getFeaturedRepos() {
    const featuredRepos = await loadLocalData('featured-repositories.json');
    if (featuredRepos) {
      console.log('Using local featured repositories data');
      return featuredRepos;
    }
    
    const repos = await fetchWithRetry(`/users/${GITHUB_USERNAME}/repos`);
    return repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4);
  }
  
  window.GitHubAPI = {
    username: GITHUB_USERNAME,
    fetchFromGitHub,
    fetchWithRetry,
    getUserRepos: () => fetchWithRetry(`/users/${GITHUB_USERNAME}/repos`),
    getRepoDetails: (repoName) => fetchWithRetry(`/repos/${GITHUB_USERNAME}/${repoName}`),
    getRepoLanguages,
    getFeaturedRepos,
    clearCache: () => cache.clear()
  };
})();