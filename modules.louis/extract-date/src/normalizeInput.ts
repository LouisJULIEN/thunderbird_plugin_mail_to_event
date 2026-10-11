export default (input: string): string => {
  let lastInput = input;

  while (true) {
    const result = lastInput

      // 2019-02-12T00:00:00
      .replace(/(\d+)T(\d+)/, '$1 $2')

      // Italian elision: dell'8 → dell' 8 . No consequence for English
      // Covers ASCII apostrophe (U+0027), curly apostrophe (U+2019, common from word processors),
      // and modifier letter apostrophe (U+02BC, used in some languages)
      .replace(/['\u2019\u02BC](\d)/g, ' $1')

      .replace(/(\d+)\s\/\s(\d+)/, '$1/$2')

      .replace(/[.:;] /g, ' ')
      .trim()
      .replace(/[.!#?]+$/g, '')
      .replace(/ {2,}/g, ' ');

    if (result === lastInput) {
      return result;
    }

    lastInput = result;
  }
};
