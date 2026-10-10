const fs = require('fs');

function extractDriveFiles(filePath, label) {
  const content = fs.readFileSync(filePath, 'utf8');
  const files = [];
  const nameRegex = /aria-label="([^"]+\.mp3)[^"]*"/g;
  let m;
  while ((m = nameRegex.exec(content)) !== null) {
    const name = m[1].trim();
    const sub = content.slice(m.index, m.index + 500);
    const idMatch = sub.match(/data-id="([a-zA-Z0-9_-]{20,})"/);
    if (idMatch) {
      files.push({ name, id: idMatch[1] });
    }
  }
  // Deduplicate by name
  const seen = new Set();
  const deduped = files.filter(f => {
    if (seen.has(f.name)) return false;
    seen.add(f.name);
    return true;
  });

  console.log(`\n=== ${label}: Found ${deduped.length} files ===`);
  console.log(deduped);
  return deduped;
}

const sleepFiles = extractDriveFiles('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1195/content.md', 'Sleep Meditation');
const womenFiles = extractDriveFiles('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1206/content.md', 'Meditation for Women');
const shortFiles = extractDriveFiles('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1208/content.md', 'Short Meditations');
const bookFiles = extractDriveFiles('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1210/content.md', 'Audio Book');

fs.writeFileSync('scripts/parsed_drive_tracks.json', JSON.stringify({
  sleep: sleepFiles,
  women: womenFiles,
  short: shortFiles,
  book: bookFiles
}, null, 2));
