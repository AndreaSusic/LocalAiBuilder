import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 5174;

// Simple API proxy without middleware
app.all('/api/*', async (req, res) => {
  try {
    const backendUrl = `http://localhost:5000${req.originalUrl}`;
    console.log(`🔗 Proxying ${req.method} ${req.originalUrl} -> ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Backend unavailable' });
  }
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (SPA) - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`📦 Staging server running on port ${port}`);
  console.log(`🔗 API proxy: /api/* -> http://localhost:5000/api/*`);
});