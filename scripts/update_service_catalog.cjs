const fs = require('fs');

const items = JSON.parse(fs.readFileSync('scripts/formatted_section_items.json', 'utf8'));

const sectionsCode = `export const DEFAULT_SECTIONS: SleepSection[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    slug: 'sleep-meditation',
    title: 'Sleep Meditation',
    subtitle: '30 Meditation practice before sleep · Deep nervous system down-regulation',
    description: 'Clinical somatic inductions designed to quiet cognitive loops and induce restorative delta sleep.',
    sectionType: 'meditation',
    pricingType: 'standalone',
    priceDisplay: 'AED 49',
    priceAed: 'AED 49',
    priceUsd: '$12.99',
    pricingTagline: 'Lifetime access to all 19 sleep meditations',
    badge: 'Sleep Rest',
    sortOrder: 1,
    isPublished: true,
    freeCount: 3,
    paidCount: 16,
    itemsCount: 19,
  },
  {
    id: 'e2000000-0000-4000-8000-000000000002',
    slug: 'meditation-women',
    title: 'Meditation for Women',
    subtitle: 'Targeted cyclical rest, emotional disconnect & inner safety',
    description: 'Specialized grounding practices addressing body shame, emotional overload, relationship dynamics, and deep serenity.',
    sectionType: 'meditation',
    pricingType: 'standalone',
    priceDisplay: 'AED 59',
    priceAed: 'AED 59',
    priceUsd: '$15.99',
    pricingTagline: 'Complete series access + future updates',
    badge: 'Women Rest',
    sortOrder: 2,
    isPublished: true,
    freeCount: 2,
    paidCount: 6,
    itemsCount: 8,
  },
  {
    id: 'e4000000-0000-4000-8000-000000000004',
    slug: 'short-meditations',
    title: 'Short Meditations',
    subtitle: 'Meditations in outer roles & inner balance',
    description: 'Concise 3-7 minute awareness practices for high-friction moments during the day or right before twilight rest.',
    sectionType: 'meditation',
    pricingType: 'standalone',
    priceDisplay: 'AED 29',
    priceAed: 'AED 29',
    priceUsd: '$7.99',
    pricingTagline: 'Quick recalibration in under 5 minutes',
    badge: 'Short Reset',
    sortOrder: 3,
    isPublished: true,
    freeCount: 1,
    paidCount: 2,
    itemsCount: 3,
  },
  {
    id: 'e3000000-0000-4000-8000-000000000003',
    slug: 'audiobook',
    title: 'Human 2.0 Audiobook',
    subtitle: 'The definitive 45-chapter neurological immersion and audio philosophy',
    description: 'Chapter 1 free sample, full 45 chapters unlocked with standalone purchase or Sovereign membership.',
    sectionType: 'audiobook',
    pricingType: 'tiered',
    priceDisplay: 'AED 39',
    priceAed: 'AED 39',
    priceUsd: '$9.99',
    pricingTagline: 'All 45 Chapters · High bitrate offline audio',
    badge: '45 Chapters',
    sortOrder: 4,
    isPublished: true,
    freeCount: 1,
    paidCount: 44,
    itemsCount: 45,
  },
];`;

const itemsFormatted = items.map(it => {
  return `  {
    id: ${JSON.stringify(it.id)},
    sectionId: ${JSON.stringify(it.sectionId)},
    title: ${JSON.stringify(it.title)},
    subtitle: ${JSON.stringify(it.subtitle)},
    description: ${JSON.stringify(it.description)},
    durationSeconds: ${it.durationSeconds},
    durationFormatted: ${JSON.stringify(it.durationFormatted)},
    access: ${JSON.stringify(it.access)},
    audioPath: ${JSON.stringify(it.audioPath)},
    audioBucket: ${JSON.stringify(it.audioBucket)},
    sortOrder: ${it.sortOrder},
    isPublished: true,
    playCount: ${it.playCount},
  },`;
}).join('\n');

const itemsCode = `export const DEFAULT_SECTION_ITEMS: SleepSectionItem[] = [\n${itemsFormatted}\n];`;

const targetFile = 'src/services/sleepContentService.ts';
let content = fs.readFileSync(targetFile, 'utf8');

const startMarker = 'export const DEFAULT_SECTIONS: SleepSection[] = [';
const endMarker = 'export const DEFAULT_SETTINGS: Record<string, unknown> = {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const replacement = `${sectionsCode}\n\n${itemsCode}\n\n`;
const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log('Updated sleepContentService.ts successfully!');
