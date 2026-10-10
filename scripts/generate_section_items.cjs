const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/parsed_drive_tracks.json', 'utf8'));

function formatTitle(name) {
  return name
    .replace(/\.mp3$/i, '')
    .replace(/^x22\s*/i, '')
    .trim()
    .replace(/\bwen\b/gi, 'when')
    .replace(/\bn\b/gi, '&')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// 1. Sleep items (19 items)
const sleepItems = data.sleep.map((f, idx) => ({
  id: `item-sleep-${idx + 1}`,
  sectionId: 'e1000000-0000-4000-8000-000000000001',
  title: formatTitle(f.name),
  subtitle: idx < 3 ? 'Free introductory somatic practice' : 'Restorative sleep practice',
  description: `Guided awareness practice for nighttime down-regulation. Narrated by Vinay Kapoor.`,
  durationSeconds: 600 + (idx * 60) % 900,
  durationFormatted: `${10 + (idx % 12)}:00`,
  access: idx < 3 ? 'free' : 'paid',
  audioPath: `https://drive.google.com/uc?export=download&id=${f.id}`,
  audioBucket: idx < 3 ? 'sleep-audio-free' : 'sleep-audio-pro',
  sortOrder: idx + 1,
  isPublished: true,
  playCount: 120 + idx * 17,
  driveId: f.id,
}));

// 2. Women items (8 items)
const womenItems = data.women.map((f, idx) => ({
  id: `item-women-${idx + 1}`,
  sectionId: 'e2000000-0000-4000-8000-000000000002',
  title: formatTitle(f.name),
  subtitle: idx < 2 ? 'Free restorative practice for women' : 'Specialized feminine restoration practice',
  description: `Cyclical rest, emotional release, and inner balance practice. Narrated by Vinay Kapoor.`,
  durationSeconds: 720 + (idx * 90) % 600,
  durationFormatted: `${12 + (idx % 8)}:00`,
  access: idx < 2 ? 'free' : 'paid',
  audioPath: `https://drive.google.com/uc?export=download&id=${f.id}`,
  audioBucket: idx < 2 ? 'sleep-audio-free' : 'sleep-audio-pro',
  sortOrder: idx + 1,
  isPublished: true,
  playCount: 95 + idx * 23,
  driveId: f.id,
}));

// 3. Short items (3 items)
const shortItems = data.short.map((f, idx) => ({
  id: `item-short-${idx + 1}`,
  sectionId: 'e4000000-0000-4000-8000-000000000004',
  title: formatTitle(f.name),
  subtitle: idx === 0 ? 'Free short recalibration' : 'Acute inner balance pacer',
  description: `Rapid 3-7 minute recalibration for high-stress transitions and inner calm.`,
  durationSeconds: 300 + idx * 120,
  durationFormatted: `${5 + idx * 2}:00`,
  access: idx === 0 ? 'free' : 'paid',
  audioPath: `https://drive.google.com/uc?export=download&id=${f.id}`,
  audioBucket: idx === 0 ? 'sleep-audio-free' : 'sleep-audio-pro',
  sortOrder: idx + 1,
  isPublished: true,
  playCount: 180 + idx * 35,
  driveId: f.id,
}));

const allItems = [...sleepItems, ...womenItems, ...shortItems];
fs.writeFileSync('scripts/formatted_section_items.json', JSON.stringify(allItems, null, 2));
console.log(`Generated ${allItems.length} section items successfully!`);
