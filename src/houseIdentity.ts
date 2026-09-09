import { z } from 'zod';

export const HOUSE_MOTIFS = {
  vine: 'Vine & tendril',
  sun: 'Rising sun',
  arch: 'Cellar arch',
};
export const HOUSE_COLORS = {
  claret: '#784759',
  olive: '#596d50',
  ochre: '#946b36',
};
export const houseIdentitySchema = z
  .object({
    motif: z.enum(['vine', 'sun', 'arch']),
    color: z.enum(['claret', 'olive', 'ochre']),
    monogram: z.string().trim().max(3),
  })
  .strict();
export type HouseIdentity = z.infer<typeof houseIdentitySchema>;
export const DEFAULT_HOUSE: HouseIdentity = {
  motif: 'vine',
  color: 'claret',
  monogram: '',
};
export function houseInitials(name: string, identity: HouseIdentity) {
  if (identity.monogram) return identity.monogram;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toLocaleUpperCase();
  // Uppercasing can expand letters. Keep generated marks within the save limit
  // without splitting a surrogate pair in an estate name.
  let mark = '';
  for (const character of initials) {
    if (mark.length + character.length > 3) break;
    mark += character;
  }
  return mark;
}
