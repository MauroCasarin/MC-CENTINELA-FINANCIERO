const https = require('https');
https.get('https://api.argentinadatos.com/v1/cotizaciones/dolares', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed.slice(-10)));
  });
});
