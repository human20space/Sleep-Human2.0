const fs = require('fs');

const list = JSON.parse(fs.readFileSync('scripts/chapters_list.json', 'utf8'));
const idMap = new Map();
list.forEach(item => {
  idMap.set(item.name, item.id);
});

let audioDataCode = fs.readFileSync('src/data/audioChaptersData.ts', 'utf8');

// For each chapter in list, inject driveId
list.forEach(item => {
  // Find fileName: 'Chapter X.mp3'
  const searchStr = `fileName: '${item.name}',`;
  if (audioDataCode.includes(searchStr)) {
    const replacement = `fileName: '${item.name}',\n    driveId: '${item.id}',`;
    if (!audioDataCode.includes(`driveId: '${item.id}'`)) {
      audioDataCode = audioDataCode.replace(searchStr, replacement);
    }
  }
});

fs.writeFileSync('src/data/audioChaptersData.ts', audioDataCode);
console.log('Successfully updated src/data/audioChaptersData.ts with driveIds!');
