import http from 'node:http';

const data = JSON.stringify({ name: 'Test', framework: 'react' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/projects/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\\nBody: ${body}`));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
