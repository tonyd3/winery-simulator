import { z } from 'zod';
import { labelDesignSchema, vintage } from './winemaking';
import type { GameState, Wine } from './game';
import { VARIETIES } from './catalog';

const count = z.number().int().min(0).max(1e12);
const year = z.number().int().min(1).max(10000);
const keepsakeSchema = z
  .object({
    id: count,
    name: z.string().max(40),
    estate: z.string().max(32),
    vintage: z.string().max(100),
    founded: count,
    release: count,
    quality: z.number().min(0).max(100),
    design: labelDesignSchema,
    white: z.boolean(),
    aromas: z.array(z.string().max(160)).max(8),
  })
  .strict();
const chapterSchema = z
  .object({
    year,
    harvestKg: count,
    harvests: count,
    bottles: count,
    releases: count,
    keepsakes: z.array(keepsakeSchema).max(6),
    moments: z
      .array(
        z
          .object({
            week: z.number().int().min(1).max(100000),
            text: z.string().max(240),
          })
          .strict(),
      )
      .max(8),
    note: z.string().trim().max(600),
  })
  .strict();
export const vintageJournalSchema = z
  .object({
    startedWeek: z.number().int().min(1).max(100000),
    chapters: z.array(chapterSchema).max(10000),
  })
  .strict()
  .superRefine((journal, ctx) => {
    if (
      new Set(journal.chapters.map((chapter) => chapter.year)).size !==
      journal.chapters.length
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate vintage journal year.',
      });
  });
export type VintageJournal = z.infer<typeof vintageJournalSchema>;
export type VintageChapter = z.infer<typeof chapterSchema>;
const yearAt = (week: number) => Math.floor((week - 1) / 12) + 1;

export function journalChapter(journal: VintageJournal, year: number) {
  let chapter = journal.chapters.find((chapter) => chapter.year === year);
  if (!chapter) {
    chapter = {
      year,
      harvestKg: 0,
      harvests: 0,
      bottles: 0,
      releases: 0,
      keepsakes: [],
      moments: [],
      note: '',
    };
    journal.chapters.push(chapter);
  }
  return chapter;
}

export function rememberRelease(
  journal: VintageJournal,
  wine: Wine,
  white: boolean,
) {
  const chapter = journalChapter(journal, yearAt(wine.bottled));
  const years = [...new Set(wine.components.map((part) => part.year))].sort(
    (a, b) => a - b,
  );
  const vintageLabel =
    years.length > 6
      ? `${years.length} vintages · Years ${years[0]}–${years.at(-1)}`
      : vintage(wine.components);
  chapter.releases++;
  chapter.bottles += wine.produced ?? 0;
  chapter.keepsakes.push({
    id: wine.id,
    name: wine.label,
    estate: wine.estate,
    vintage: vintageLabel,
    founded: wine.founded,
    release: wine.release,
    quality: wine.quality,
    design: structuredClone(wine.design),
    white,
    aromas: wine.tasting?.aromas.slice(0, 8) ?? [],
  });
  chapter.keepsakes = chapter.keepsakes.slice(-6);
}

export function rememberMoment(
  journal: VintageJournal,
  week: number,
  text: string,
) {
  const chapter = journalChapter(journal, yearAt(week));
  chapter.moments = [...chapter.moments, { week, text }].slice(-8);
}

export function estateJournal(
  state: Pick<
    GameState,
    'vintageJournal' | 'week' | 'wines' | 'estates' | 'hybrids'
  >,
): VintageJournal {
  if (state.vintageJournal) return state.vintageJournal;
  const journal: VintageJournal = { startedWeek: state.week, chapters: [] };
  // Recover only facts still present in an old save. No inferred past harvests.
  for (const wine of [...state.wines].sort(
    (a, b) => a.bottled - b.bottled || a.id - b.id,
  )) {
    const grape =
      VARIETIES[wine.variety] ??
      state.hybrids.find((g) => g.id === wine.variety);
    rememberRelease(journal, wine, grape?.wineType === 'White');
  }
  return journal;
}
