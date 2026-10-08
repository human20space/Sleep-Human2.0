const fs = require('fs');

const path = 'C:/Users/annak/.gemini/antigravity/brain/b70c61c7-f849-4e73-bc39-95461381dfc1/.system_generated/steps/314/content.md';
const content = fs.readFileSync(path, 'utf8');

// Match: aria-label="(Chapter [^"]+\.mp3)[\s\S]*?data-id="([a-zA-Z0-9_-]+)"
const regex = /aria-label="(Chapter\s*[\d\.]+\.mp3)[^"]*"[\s\S]*?data-id="([a-zA-Z0-9_-]{25,})"/gi;
const map = new Map();
let m;

while ((m = regex.exec(content)) !== null) {
  const name = m[1].replace(/\s+/g, ' ').trim();
  const id = m[2];
  if (!map.has(name)) {
    map.set(name, id);
  }
}

console.log(`Found ${map.size} chapters:`);
const list = [];
for (const [name, id] of map.entries()) {
  list.push({ name, id });
}
// Sort by chapter number
list.sort((a, b) => {
  const na = parseFloat(a.name.replace(/[^0-9.]/g, '')) || 0;
  const nb = parseFloat(b.name.replace(/[^0-9.]/g, '')) || 0;
  return na - nb;
});

console.log(JSON.stringify(list, null, 2));
fs.writeFileSync('scripts/chapters_list.json', JSON.stringify(list, null, 2));
