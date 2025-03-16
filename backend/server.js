require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'xurst';

// CORS configuration - updated to allow xurst.github.io
const corsOptions = {
  origin: ['https://xurst.github.io', 'http://localhost:5504', 'http://127.0.0.1:5504', 'http://10.0.0.72:5504'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Cache setup (in-memory for simplicity)
const cache = {
  data: {},
  set: function(key, data, ttl = 3600000) {
    this.data[key] = {
      data: data,
      expiry: Date.now() + ttl
    };
  },
  get: function(key) {
    const item = this.data[key];
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    
    return item.data;
  },
  clear: function() {
    this.data = {};
  }
};

// GitHub API helper
const fetchFromGitHub = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  const cacheKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for ${endpoint}`);
    return cachedData;
  }
  
  // Prepare headers with auth token
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_TOKEN}`
  };
  
  try {
    console.log(`Fetching from GitHub: ${url}`);
    const response = await axios.get(url, { 
      headers,
      ...options
    });
    
    // Cache the result
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from GitHub: ${url}`, error.message);
    throw error;
  }
};

// Routes
app.get('/api/user/repos', async (req, res) => {
  try {
    const data = await fetchFromGitHub(`/users/${GITHUB_USERNAME}/repos`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/repos/:repoName', async (req, res) => {
  try {
    const data = await fetchFromGitHub(`/repos/${GITHUB_USERNAME}/${req.params.repoName}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/repos/:repoName/languages', async (req, res) => {
  try {
    const data = await fetchFromGitHub(`/repos/${GITHUB_USERNAME}/${req.params.repoName}/languages`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/featured', async (req, res) => {
  try {
    const repos = await fetchFromGitHub(`/users/${GITHUB_USERNAME}/repos`);
    const featuredRepos = repos
      .filter(repo => !repo.fork && repo.name !== "xurst.github.io")
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4);
    
    res.json(featuredRepos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cache endpoint
app.post('/api/clear-cache', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint for easy testing
app.get('/', (req, res) => {
  res.send('Portfolio API server is running. Available endpoints: /api/user/repos, /api/featured, /api/repos/:repoName, /api/repos/:repoName/languages');
});

// Serve static files for testing
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});