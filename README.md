# xurst's Portfolio Website

My personal portfolio website showcasing my projects, skills, and information.

## Features

- Responsive design for all devices
- GitHub API integration to display my repositories
- Interactive UI with smooth animations
- Project filtering and search functionality
- Categorized project display

## Technical Details

- Built with HTML, CSS, and JavaScript
- Uses GitHub API to fetch repository data
- LocalStorage caching to reduce API calls
- Mobile-first responsive design

## GitHub API Usage

The site uses the GitHub API to fetch my repositories and display them. To avoid hitting rate limits:

1. API responses are cached in localStorage for 1 hour
2. Requests use retry logic with exponential backoff
3. The site gracefully handles API rate limits

## Development

To run this site locally:

1. Clone the repository
2. Open `index.html` in your browser

No build process is required.