// Accept accents and either apostrophe style in names such as Nero d’Avola.
export function matchesSearch(text: string, query: string) {
  const fold = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[‘’]/g, "'")
      .toLowerCase();
  return fold(text).includes(fold(query.trim()));
}
