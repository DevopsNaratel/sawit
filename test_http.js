const http = require('http'); const server = http.createServer((req, res) => res.end('hi')); server.listen(3002, () => console.log('HTTP listening'));
