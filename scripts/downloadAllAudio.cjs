const https = require('https');
const fs = require('fs');
const path = require('path');

const chapters = JSON.parse(fs.readFileSync('scripts/chapters_list.json', 'utf8'));
const audioDir = path.join(__dirname, '../public/audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function downloadFile(fileId, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      console.log(`[SKIP] Already exists: ${path.basename(dest)}`);
      return resolve();
    }

    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    function get(u) {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Failed with status ${res.statusCode} for ${path.basename(dest)}`));
        }

        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            const size = (fs.statSync(dest).size / (1024 * 1024)).toFixed(2);
            console.log(`[DONE] ${path.basename(dest)} (${size} MB)`);
            resolve();
          });
        });

        fileStream.on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      }).on('error', reject);
    }

    get(url);
  });
}

// Download with concurrency limit of 3
async function run() {
  console.log(`Starting download of ${chapters.length} chapters...`);
  const queue = [...chapters];
  const workers = Array(3).fill(null).map(async (_, workerId) => {
    while (queue.length > 0) {
      const item = queue.shift();
      const dest = path.join(audioDir, item.name);
      try {
        await downloadFile(item.id, dest);
      } catch (err) {
        console.error(`[ERROR] ${item.name}:`, err.message);
      }
    }
  });

  await Promise.all(workers);
  console.log('All downloads completed!');
}

run();
