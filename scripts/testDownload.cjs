const https = require('https');
const fs = require('fs');

const fileId = '1tIusy7rbpkANCxu8UcPOJVDOXZyQ2cFr';
const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

function download(url, dest) {
  https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers.location || res.headers['content-type']);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      download(res.headers.location, dest);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        const stats = fs.statSync(dest);
        console.log('Downloaded bytes:', stats.size);
      });
    });
  }).on('error', (err) => {
    console.error('Error:', err);
  });
}

download(url, 'public/audio/Chapter 1.mp3');
