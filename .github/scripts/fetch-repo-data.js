const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// Initialize Octokit with the GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// GitHub username
const USERNAME = 'xurst';

// Output directory
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchRepositories() {
  console.log(`Fetching repositories for ${USERNAME}...`);
  
  try {
    // Get all repositories
    const { data: repos } = await octokit.repos.listForUser({
      username: USERNAME,
      per_page: 100,
      sort: 'updated',
    });
    
    // Filter out forked repositories
    const ownRepos = repos.filter(repo => !repo.fork);
    
    console.log(`Found ${ownRepos.length} repositories.`);
    
    // Process each repository to get additional data
    const enrichedRepos = [];
    
    for (const repo of ownRepos) {
      console.log(`Processing repository: ${repo.name}`);
      
      try {
        // Get language data for each repository
        const { data: languages } = await octokit.repos.listLanguages({
          owner: USERNAME,
          repo: repo.name,
        });
        
        // Add the languages to the repository object
        enrichedRepos.push({
          ...repo,
          languages,
        });
        
      } catch (error) {
        console.error(`Error fetching data for ${repo.name}:`, error.message);
        // Still add the repo even if we couldn't get languages
        enrichedRepos.push(repo);
      }
      
      // Slight delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Write the repository data to a file
    fs.writeFileSync(
      path.join(DATA_DIR, 'repositories.json'),
      JSON.stringify(enrichedRepos, null, 2)
    );
    
    // Create a separate file for featured repositories (top by stars)
    const featuredRepos = [...enrichedRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4);
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'featured-repositories.json'),
      JSON.stringify(featuredRepos, null, 2)
    );
    
    console.log('Repository data updated successfully.');
    
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    process.exit(1);
  }
}

// Execute the function
fetchRepositories();
