const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 8080;
const MIME = {
  html: 'text/html',
  css:  'text/css',
  js:   'text/javascript',
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  svg:  'image/svg+xml',
  ico:  'image/x-icon',
};

http.createServer((req, res) => {
  // Decode %20 and other URL encoding before building the file path
  const url  = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(__dirname, url === '/' ? 'index.html' : url);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + url);
      return;
    }
    const ext  = path.extname(file).slice(1).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`CookNextDoor server → http://localhost:${PORT}`);
});
