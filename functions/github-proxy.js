exports.handler = async function(event) {
  // Your GitHub token stored as environment variable in Netlify
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!event.queryStringParameters.path) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Path parameter required' }) 
    };
  }
  
  const path = event.queryStringParameters.path;
  const url = `https://api.github.com/${path}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Netlify Function'
      }
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};