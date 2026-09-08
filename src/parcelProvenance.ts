import { z } from 'zod';

// Keep the picked site's identity even if its vines or catalog details change.
export const parcelProvenanceSchema = z
  .object({
    id: z.number().int().min(1).max(192),
    name: z.string().trim().min(1).max(80),
    soil: z.string().trim().min(1).max(32),
  })
  .strict();
export type ParcelProvenance = z.infer<typeof parcelProvenanceSchema>;
export const parcelKey = (parcel?: ParcelProvenance) =>
  parcel ? JSON.stringify([parcel.id, parcel.name, parcel.soil]) : 'unrecorded';
export const parcelLabel = (parcel?: ParcelProvenance) =>
  parcel ? `${parcel.name} · ${parcel.soil} soil` : 'Parcel unrecorded';
