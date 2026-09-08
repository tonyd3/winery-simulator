export const PRESTIGE_TIERS = [
  {
    minimum: 0,
    name: 'Two-Buck Beginning',
    note: 'A humble bottle with big ambitions.',
  },
  {
    minimum: 25,
    name: 'Grocery Aisle Darling',
    note: 'The clever find in a Trader Joe’s cart.',
  },
  {
    minimum: 60,
    name: 'Weeknight Hero',
    note: 'The bottle people reach for after work.',
  },
  { minimum: 120, name: 'House Pour', note: 'A familiar name behind the bar.' },
  {
    minimum: 250,
    name: 'Bistro Favorite',
    note: 'The waiter recommends you without being asked.',
  },
  {
    minimum: 500,
    name: 'Wine-Bar Whisper',
    note: 'Word travels one glass at a time.',
  },
  {
    minimum: 900,
    name: 'Sommelier’s Secret',
    note: 'A discovery worth sharing quietly.',
  },
  {
    minimum: 1500,
    name: 'Cellar Staple',
    note: 'Collectors leave a little space for you.',
  },
  {
    minimum: 2500,
    name: 'Critic’s Darling',
    note: 'Your name starts the conversation.',
  },
  { minimum: 4000, name: 'Cult Following', note: 'Regulars become devotees.' },
  {
    minimum: 6500,
    name: 'Allocation Only',
    note: 'The waiting list has a waiting list.',
  },
  {
    minimum: 10000,
    name: 'Auction Magnet',
    note: 'Paddles rise when your name is read.',
  },
  {
    minimum: 16000,
    name: 'Grand Cru Gravity',
    note: 'The wine world begins to orbit your estate.',
  },
  {
    minimum: 25000,
    name: 'First-Growth Royalty',
    note: 'A seat among the great names.',
  },
  {
    minimum: 40000,
    name: 'Unicorn Vintage',
    note: 'More often spoken of than opened.',
  },
  {
    minimum: 65000,
    name: 'Pétrus Pantheon',
    note: 'A legendary name. A story still being written.',
  },
] as const;

export const QUALITY_RESPONSES = [
  {
    minimum: 95,
    range: '95–100',
    name: 'Exceptional',
    retail: 0.16,
    wholesale: 0.04,
    text: 'A memorable bottle that earns strong word of mouth.',
  },
  {
    minimum: 90,
    range: '90–94',
    name: 'Outstanding',
    retail: 0.1,
    wholesale: 0.03,
    text: 'Collectors recommend this release.',
  },
  {
    minimum: 80,
    range: '80–89',
    name: 'Fine wine',
    retail: 0.06,
    wholesale: 0.02,
    text: 'A confident recommendation that builds your name.',
  },
  {
    minimum: 70,
    range: '70–79',
    name: 'Well made',
    retail: 0.03,
    wholesale: 0.01,
    text: 'An enjoyable bottle that earns returning customers.',
  },
  {
    minimum: 60,
    range: '60–69',
    name: 'Everyday wine',
    retail: 0.01,
    wholesale: 0,
    text: 'Modest word of mouth. Riper fruit and maturation can improve the next vintage.',
  },
  {
    minimum: 0,
    range: '0–59',
    name: 'Disappointing',
    retail: -0.01,
    wholesale: 0,
    text: 'Shop customers lose confidence. Improve the fruit or blend before releasing more.',
  },
] as const;
export const qualityResponse = (quality: number) =>
  QUALITY_RESPONSES.find((band) => quality >= band.minimum)!;
export const signedPrestige = (score: number) =>
  `${score < 0 ? '−' : '+'}${Math.abs(score).toFixed(2)}`;

export function prestigeStanding(score: number) {
  let index = 0;
  while (
    index + 1 < PRESTIGE_TIERS.length &&
    score >= PRESTIGE_TIERS[index + 1].minimum
  )
    index++;
  return {
    index,
    tier: PRESTIGE_TIERS[index],
    next: PRESTIGE_TIERS[index + 1] ?? null,
  };
}

// Keep the established 0–100 economy intact. Above 100, each doubling of
// Prestige adds 25 influence, so unlimited score does not mean linear demand.
export const prestigeInfluence = (score: number) =>
  score <= 100 ? score : 100 + 25 * Math.log2(score / 100);

export const formatPrestige = (score: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    notation:
      score >= 1e12
        ? 'scientific'
        : compact && score >= 10000
          ? 'compact'
          : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(score);
