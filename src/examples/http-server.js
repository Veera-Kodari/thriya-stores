/**
 * Example: Creating a simple HTTP server
 * Run: node src/examples/http-server.js
 * Then visit http://localhost:3000
 */

const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js HTTP server!\n');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
