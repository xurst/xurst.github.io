const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(__dirname));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n=== mobile debug server running ===');
    console.log(`local url: http://localhost:${PORT}`);
    console.log(`network url: http://${localIP}:${PORT}`);
    console.log('\nstatic file paths configured:');
    console.log('- css: /css/*');
    console.log('- javascript: /src/js/*');
    console.log('\nuse the network url for mobile device testing');
    console.log('=====================================\n');
});
app.use((req, res, next) => {
    if (req.method === 'GET' && (req.path.includes('.css') || req.path.includes('.js'))) {
        console.log(`static file requested: ${req.path}`);
    }
    next();
});