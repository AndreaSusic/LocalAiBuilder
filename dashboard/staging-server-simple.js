import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 5174;

// JSON parsing middleware
app.use(express.json());

// API proxy handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // This is an API request - proxy it to the backend
    const backendUrl = `http://localhost:5000${req.originalUrl}`;
    console.log(`🔗 Proxying ${req.method} ${req.originalUrl} -> ${backendUrl}`);
    
    fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || ''
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    })
    .then(response => {
      response.text().then(data => {
        res.status(response.status).send(data);
      });
    })
    .catch(error => {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Backend unavailable' });
    });
  } else {
    // Not an API request - continue to static file handler
    next();
  }
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (SPA) - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Static build not found. Run: npm run build');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`📦 Staging server running on port ${port}`);
  console.log(`🔗 API proxy: /api/* -> http://localhost:5000/api/*`);
  console.log(`📁 Static files: ${path.join(__dirname, 'dist')}`);
});