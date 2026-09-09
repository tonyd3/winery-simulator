import type { LabelDesign } from './winemaking';

export const BOTTLE_LOOKS: {
  name: string;
  description: string;
  design: LabelDesign;
}[] = [
  {
    name: 'House reserve',
    description: 'A crest, warm paper, and dipped wax.',
    design: {
      style: 'heritage',
      bottle: 'shouldered',
      color: 'claret',
      finish: 'wax',
      paper: 'cream',
    },
  },
  {
    name: 'Garden party',
    description: 'Botanical vines and soft, rose-colored paper.',
    design: {
      style: 'botanical',
      bottle: 'rounded',
      color: 'olive',
      finish: 'cork',
      paper: 'blush',
    },
  },
  {
    name: 'After hours',
    description: 'Deep dusk ink and a clean, tapered silhouette.',
    design: {
      style: 'modern',
      bottle: 'tapered',
      color: 'dusk',
      finish: 'foil',
      paper: 'ivory',
    },
  },
  {
    name: 'Clay & sun',
    description: 'Terracotta ink, a sun motif, and an amphora.',
    design: {
      style: 'vintage',
      bottle: 'amphora',
      color: 'terracotta',
      finish: 'wrap',
      paper: 'cream',
    },
  },
];

export function applyBottleLook(
  current: LabelDesign,
  look: LabelDesign,
): LabelDesign {
  return {
    ...look,
    ...(current.note !== undefined ? { note: current.note } : {}),
  };
}

// Wrap long words without dropping text or splitting an emoji's surrogate pair.
export function labelLines(text: string, width: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    let characters = Array.from(word);
    const last = lines.length - 1;
    if (
      last >= 0 &&
      Array.from(lines[last]).length + characters.length + 1 <= width
    ) {
      lines[last] += ` ${word}`;
      continue;
    }
    while (characters.length > width) {
      lines.push(characters.slice(0, width).join(''));
      characters = characters.slice(width);
    }
    if (characters.length) lines.push(characters.join(''));
  }
  return lines;
}

export function backLabelNote(note: string | undefined, estate: string) {
  return note?.trim() || `A wine from ${estate}, made to be opened and shared.`;
}
