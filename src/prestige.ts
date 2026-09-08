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

export const PRESTIGE_EARNINGS = { retail: 0.04, wholesale: 0.01 };

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
