# GitHub Actions Setup Guide

This guide explains how to set up the GitHub Action that automatically fetches and stores your GitHub repository data as static JSON files in your repository.

## How It Works

The GitHub Action runs on a schedule (once per day) and:

1. Fetches your repository data from the GitHub API
2. Stores it as static JSON files in the `/data` directory
3. Commits and pushes these changes automatically

This approach has several benefits:
- No API rate limits for visitors
- Much faster loading since data is pre-fetched
- Works even if the GitHub API is down
- Scales to any number of visitors

## Setup Instructions

### 1. Push the Code to GitHub

Make sure your repository contains:
- `.github/workflows/update-repo-data.yml` file
- `.github/scripts/fetch-repo-data.js` file
- `package.json` file with the required dependencies
- Empty `data` directory (the action will populate it)

### 2. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. If asked to enable Actions, confirm by clicking "I understand my workflows, go ahead and enable them"

### 3. Generate a Personal Access Token (PAT)

The GitHub Action uses a built-in token (`secrets.GITHUB_TOKEN`), but this token has limited permissions. If you encounter permission issues, you can create a Personal Access Token:

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "Personal access tokens" > "Tokens (classic)"
3. Click "Generate new token"
4. Give it a name like "Portfolio Repository Data"
5. Select scopes: `repo` and `workflow`
6. Click "Generate token" and copy the token

### 4. Add the Token as a Secret (Optional, only if needed)

1. Go to your repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `PAT`
5. Value: Paste your Personal Access Token
6. Click "Add secret"

If you do this, also update the `.github/workflows/update-repo-data.yml` file to use this token:
```yaml
- name: Fetch GitHub repository data
  env:
    GITHUB_TOKEN: ${{ secrets.PAT }}
  run: |
    mkdir -p data
    node .github/scripts/fetch-repo-data.js
```

### 5. Trigger the Action Manually

1. Go to the "Actions" tab in your repository
2. Click on the "Update Repository Data" workflow
3. Click "Run workflow" > "Run workflow"

This will run the action immediately to generate your data files.

### 6. Verify It Works

After the action completes:
1. Check the `data` directory in your repository
2. You should see `repositories.json` and `featured-repositories.json` files
3. Open your website and verify it loads correctly

## How to Update

The action runs automatically:
- Once per day at midnight (UTC)
- When you push to the main branch
- Manually when you trigger it from the Actions tab

## Troubleshooting

If the action fails:
1. Go to the "Actions" tab
2. Click on the failed run
3. Examine the logs to see the error

Common issues:
- Permission errors: Try using a Personal Access Token as described above
- Rate limit errors: The action might be hitting GitHub API rate limits, try running it less frequently
- JavaScript errors: Check the fetch-repo-data.js script for any issues

## Understanding the Code

### 1. The GitHub Action Workflow

The `.github/workflows/update-repo-data.yml` file defines when and how the action runs:
- It runs on a schedule, on pushes to main, and manually
- It uses Node.js to run the fetch script
- It commits and pushes any changes back to the repository

### 2. The Fetch Script

The `.github/scripts/fetch-repo-data.js` file:
- Fetches your repositories using the GitHub API
- Gets language data for each repository
- Saves this data to JSON files
- Creates a separate file for featured (top-starred) repositories

### 3. The Frontend Code

The website's JavaScript:
- First tries to load data from the static JSON files
- Falls back to API calls if the static files aren't available
- Uses localStorage caching as a final fallback

This multi-layered approach ensures your website always works, even during deploys or if something goes wrong with the action.