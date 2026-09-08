// Let players find names such as Carménère or Grüner without typing accents.
export function matchesSearch(text: string, query: string) {
  const fold = (value: string) =>
    value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return fold(text).includes(fold(query.trim()));
}
