module.exports = scriptsDiff => {
  if (
    typeof scriptsDiff === 'object' &&
    scriptsDiff !== null &&
    typeof scriptsDiff.text === 'string'
  ) {
    const splitDiff = scriptsDiff.text.split('\n');
    const promptChoices = splitDiff
      .slice(splitDiff, splitDiff.length - 1)
      .reduce((choices, diffLine) => {
        // For the choice's `value`, use the script name
        const valueMatch = diffLine.match(/(\S+):/);

        if (valueMatch !== null) {
          const value = valueMatch[1];

          const choice = {
            name: diffLine,
            short: value,
            value
          };
          return [...choices, choice];
        }

        return choices;
      }, []);

    return promptChoices;
  }

  return [];
};
