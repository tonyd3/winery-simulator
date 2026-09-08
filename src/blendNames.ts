import type { RegionId } from './catalog';

const BLEND_NAMES: Record<RegionId, string[]> = {
  bordeaux: [
    'Cuvée des Deux Rives',
    'Terre et Lumière',
    'Le Grand Accord',
    'Clair de Lune',
    'La Rencontre',
    'Les Jours Dorés',
    'Cuvée du Soir',
    'Le Fil Rouge',
  ],
  burgundy: [
    'Cuvée des Murets',
    'Les Pierres Douces',
    'L’Heure Dorée',
    'La Combe Secrète',
    'Cuvée des Saisons',
    'Le Chant des Vignes',
    'Lumière d’Automne',
    'Les Deux Chemins',
  ],
  napa: [
    'Golden Hour',
    'The Gathering',
    'Second Nature',
    'Valley Harmony',
    'Kindred',
    'Afterglow',
    'The Long Table',
    'Evening Accord',
  ],
  mosel: [
    'Abendklang',
    'Zwei Ufer',
    'Goldener Faden',
    'Schieferlicht',
    'Flusspoesie',
    'Morgenrot',
    'Sonnenlied',
    'Die Begegnung',
  ],
  tuscany: [
    'Incontro',
    'Luce di Sera',
    'Due Colline',
    'Filo d’Oro',
    'Armonia',
    'Terra e Cielo',
    'Vento Gentile',
    'Ultima Luce',
  ],
  rioja: [
    'Encuentro',
    'Dos Caminos',
    'Luz de Otoño',
    'Hilo de Oro',
    'Tierra Serena',
    'La Sobremesa',
    'Entre Colinas',
    'Viento del Ebro',
  ],
  mendoza: [
    'Cielo Compartido',
    'Luz Andina',
    'Dos Alturas',
    'Abrazo del Sol',
    'Eco de Montaña',
    'Horizonte',
    'Tierra del Alba',
    'Noche Estrellada',
  ],
  barossa: [
    'Red Earth',
    'The Muster',
    'Copper Dusk',
    'Old Friends',
    'Wattle & Stone',
    'The Long Paddock',
    'Ember Song',
    'Evening Chorus',
  ],
};

export function generateBlendName(region: RegionId, currentName: string) {
  const choices = BLEND_NAMES[region].filter(
    (name) => name.toLowerCase() !== currentName.trim().toLowerCase(),
  );
  return choices[Math.floor(Math.random() * choices.length)];
}
