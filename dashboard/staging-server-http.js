import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 5174;

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

async function proxyApiRequest(req, res) {
  const backendUrl = `http://localhost:5000${req.url}`;
  console.log(`🔗 Proxying ${req.method} ${req.url} -> ${backendUrl}`);
  
  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || ''
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.text();
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  }
}

function serveStaticFile(req, res, filePath) {
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Handle API requests
  if (req.url.startsWith('/api/')) {
    proxyApiRequest(req, res);
    return;
  }
  
  // Handle static file requests
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveStaticFile(req, res, filePath);
    return;
  }
  
  // For React Router - serve index.html for all other routes
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    serveStaticFile(req, res, indexPath);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Static build not found. Run: npm run build');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`📦 Staging server running on port ${port}`);
  console.log(`🔗 API proxy: /api/* -> http://localhost:5000/api/*`);
  console.log(`📁 Static files: ${path.join(__dirname, 'dist')}`);
});