const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Get local IP address
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        for (const interface of interfaces[interfaceName]) {
            if (!interface.internal && interface.family === 'IPv4') {
                return interface.address;
            }
        }
    }
    return 'localhost';
};

// Modified CSP for development with static file access
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://www.gstatic.com",
                "https://apis.google.com",
                "https://cdnjs.cloudflare.com",
                "https://*.firebaseapp.com",
                "https://*.googleapis.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"],
            upgradeInsecureRequests: null
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(compression());

// Explicitly define static file serving for each directory
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server with detailed logging
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n=== Mobile Debug Server Running ===');
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log(`Network URL: http://${localIP}:${PORT}`);
    console.log('\nStatic file paths configured:');
    console.log('- CSS: /css/*');
    console.log('- JavaScript: /src/js/*');
    console.log('\nUse the Network URL for mobile device testing');
    console.log('=====================================\n');
});

// Debug logging for static file requests
app.use((req, res, next) => {
    if (req.method === 'GET' && (req.path.includes('.css') || req.path.includes('.js'))) {
        console.log(`Static file requested: ${req.path}`);
    }
    next();
});