# Netlify Setup Instructions

This portfolio site uses Netlify Functions to securely access the GitHub API without exposing your personal access token in the public repository.

## Setup Steps

1. **Create a Netlify Account**:
   - Go to [Netlify.com](https://www.netlify.com) and sign up for a free account
   - You can sign up using your GitHub account for easier integration

2. **Create a GitHub Personal Access Token**:
   - Go to [GitHub Settings > Developer Settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Give it a description like "Portfolio Site API Access"
   - Select scopes: `public_repo` and `read:user`
   - Copy the generated token (you won't be able to see it again!)

3. **Deploy to Netlify**:
   - In the Netlify dashboard, click "New site from Git"
   - Choose GitHub as your Git provider and authorize Netlify
   - Select your `xurst.github.io` repository
   - For build settings, leave the defaults
   - Click "Deploy site"

4. **Add Environment Variable**:
   - Once deployed, go to Site settings > Environment variables
   - Add a new variable:
     - Key: `GITHUB_TOKEN`
     - Value: The personal access token you generated earlier
   - Save the setting

5. **Trigger a New Deployment**:
   - Go to the "Deploys" tab in your site dashboard
   - Click "Trigger deploy" > "Deploy site"
   - This ensures the site builds with your new environment variable

## Testing Locally

To test the GitHub API locally:
1. Run your site on a local server
2. Use the URL parameter method by adding `?github_token=YOUR_TOKEN` to the URL
   (This is for development only and will not work in production)

## Troubleshooting

If you encounter GitHub API rate limit errors:
1. Make sure your GitHub token is correctly set in Netlify
2. Check the Netlify Function logs in your site dashboard
3. Verify that the proxy function is working by checking the browser's network requests

Remember never to commit your GitHub token to the repository!