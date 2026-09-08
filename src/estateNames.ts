import type { RegionId } from './catalog';

const NAME_PARTS: Record<RegionId, [string[], string[]]> = {
  bordeaux: [
    ['Château', 'Domaine'],
    [
      'Bellecombe',
      'Montclair',
      'Rochebrune',
      'Clairval',
      'Belle Rive',
      'Beausoleil',
    ],
  ],
  burgundy: [
    ['Domaine', 'Clos'],
    [
      'des Tilleuls',
      'des Roches',
      'des Cèdres',
      'de la Combe',
      'du Val Doré',
      'des Hauts Murs',
    ],
  ],
  napa: [
    ['Golden', 'Oak', 'Silver', 'Cedar', 'Willow', 'Sunstone'],
    ['Ridge Estate', 'Valley Vineyards', 'Creek Cellars', 'Hill Winery'],
  ],
  mosel: [
    ['Weingut'],
    [
      'Sonnenfels',
      'Goldbach',
      'Steinberg',
      'Flussblick',
      'Rebenhof',
      'Abendrot',
      'Schieferkrone',
      'Morgenlicht',
    ],
  ],
  tuscany: [
    ['Tenuta', 'Podere'],
    [
      'Belmonte',
      'Poggio Alto',
      'Colle Verde',
      'Fontechiara',
      'Pietraluce',
      'Valdoro',
    ],
  ],
  rioja: [
    ['Bodega', 'Finca'],
    [
      'del Alba',
      'de la Sierra',
      'del Robledal',
      'del Sol',
      'de las Lomas',
      'del Olivo',
    ],
  ],
  mendoza: [
    ['Finca', 'Bodega'],
    [
      'Cielo Alto',
      'Piedra Clara',
      'Sol Andino',
      'Valle Dorado',
      'Luna de los Andes',
      'Monte Azul',
    ],
  ],
  barossa: [
    ['Red Gum', 'Copper', 'Wattle', 'Ironbark', 'Kestrel', 'Amber'],
    ['Ridge Estate', 'Creek Cellars', 'Hill Wines', 'Valley Vineyard'],
  ],
};

export function generateEstateName(region: RegionId, currentName: string) {
  const [beginnings, endings] = NAME_PARTS[region];
  const choices = beginnings
    .flatMap((beginning) => endings.map((ending) => `${beginning} ${ending}`))
    .filter((name) => name.toLowerCase() !== currentName.trim().toLowerCase());
  return choices[Math.floor(Math.random() * choices.length)];
}
