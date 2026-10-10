const fs = require('fs');

function inspect(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`[NOT FOUND] ${label}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  console.log(`\n=== ${label} (Title: ${titleMatch ? titleMatch[1] : 'N/A'}) ===`);
  
  const mp3Matches = [...content.matchAll(/([a-zA-Z0-9_\-\.\s\(\)]+\.mp3)/g)]
    .map(m => m[1].trim())
    .filter(m => !m.startsWith('x22'));
  const uniqueMp3 = [...new Set(mp3Matches)];
  console.log(`Found ${uniqueMp3.length} audio tracks:`, uniqueMp3);

  // Extract file IDs and names if mapped in the HTML
  // Format in Drive HTML is usually: ["FILE_ID","FILE_NAME.mp3",...]
  const fileRegex = /\["([a-zA-Z0-9_-]{28,35})","([^"]+\.mp3)"/g;
  const filesWithIds = [];
  let m;
  while ((m = fileRegex.exec(content)) !== null) {
    filesWithIds.push({ id: m[1], name: m[2] });
  }
  if (filesWithIds.length > 0) {
    console.log('Sample files with Drive IDs:', filesWithIds.slice(0, 10));
  }
}

inspect('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1195/content.md', 'Sleep Meditation');
inspect('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1206/content.md', 'Meditation for Women');
inspect('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1208/content.md', 'Short Meditations');
inspect('C:/Users/annak/.gemini/antigravity/brain/83d8a129-8135-4c57-bf94-a7fb4299e312/.system_generated/steps/1210/content.md', 'Audio Book');
