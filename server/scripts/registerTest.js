import http from 'http';
import { request } from 'http';

(async () => {
  try {
    const payload = JSON.stringify({ name: 'BenAgent', email: `ben_agent_${Date.now()}@example.com`, password: 'Pass12345' });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    await new Promise((resolve, reject) => {
      const req = request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('STATUS', res.statusCode);
          try { console.log('BODY', JSON.parse(data)); } catch (e) { console.log('BODY', data); }
          resolve();
        });
      });
      req.on('error', (err) => reject(err));
      req.write(payload);
      req.end();
    });
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();
 