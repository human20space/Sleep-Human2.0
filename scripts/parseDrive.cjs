const fs = require('fs');

const path = 'C:/Users/annak/.gemini/antigravity/brain/b70c61c7-f849-4e73-bc39-95461381dfc1/.system_generated/steps/314/content.md';
const content = fs.readFileSync(path, 'utf8');

const idx = content.indexOf('Chapter 1.mp3');
if (idx !== -1) {
  console.log('Context around Chapter 1.mp3:');
  console.log(content.slice(Math.max(0, idx - 400), idx + 400));
} else {
  console.log('Chapter 1.mp3 not found');
}
