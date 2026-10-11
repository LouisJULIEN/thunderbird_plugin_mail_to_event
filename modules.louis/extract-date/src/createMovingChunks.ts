export default (haystack: readonly string[], sliceLength: number): readonly (readonly string[])[] => {
  const slices: (readonly string[])[] = [];

  let index = 0;

  while (index < haystack.length) {
    const result = haystack.slice(index, index + sliceLength);

    if (result.length === sliceLength) {
      slices.push(result);
    }

    index++;
  }

  return slices;
};
