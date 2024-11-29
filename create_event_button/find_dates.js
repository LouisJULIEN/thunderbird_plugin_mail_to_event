const mmddyyyyPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])[/-](?<year>\d{4})\b/gm;
const ddmmyyyyPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])[/-](?<year>\d{4})\b/gm;
const yyyymmddPattern = /\b(?<year>\d{4})[/-](?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gm;
const ddmmPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])\b/gm;
const mmddPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gm;

const punctuationOrSpace = '\.|,|\\s|!'
const naturalMonthsRegex = `` +
    `jan[u|${punctuationOrSpace}]|` +
    `feb[r|${punctuationOrSpace}]|` +
    `mar[c|${punctuationOrSpace}]|` +
    `apr[i|${punctuationOrSpace}]|` +
    `apr[i|${punctuationOrSpace}]|` +
    `may[${punctuationOrSpace}]|` +
    `jun[e|${punctuationOrSpace}]|` +
    `jul[y|${punctuationOrSpace}]|` +
    `aug[u|${punctuationOrSpace}]|` +
    `sep[t|${punctuationOrSpace}]|` +
    `oct[o|${punctuationOrSpace}]|` +
    `nov[e|${punctuationOrSpace}]|` +
    `dec[e|${punctuationOrSpace}]` +
    ``

export const ddmonthPattern = new RegExp(
    `(?<day>0[1-9]|[12][0-9]|3[01]).*(?<month>(${naturalMonthsRegex})).*(?<year>\\d{4})?.*`,
    'gim'
)
const monthddPattern = new RegExp(
    `(?<month>(${naturalMonthsRegex})).*(?<day>0[1-9]|[12][0-9]|3[01]).*(?<year>\\d{4})?.*`,
    'gim'
)

const allDatesPatternByImportance = [
    ddmmyyyyPattern,
    mmddyyyyPattern,
    yyyymmddPattern,
    ddmonthPattern,
    monthddPattern,
    ddmmPattern,
    mmddPattern
]

export const splitTextIntoSentences = (text) => {
    return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!|\n)\s*/);

}

function findDatesByPattern(text, pattern, extraData) {
    let matches = [];
    let match;
    const sentences = splitTextIntoSentences(text)

    sentences.map((text) => {
        while ((match = pattern.exec(text)) !== null) {
            matches.push({
                ...extraData,
                originalText: match[0],
                regexIndex: match.index,
                ...match.groups
            });
        }
    })
    return matches;
}

const removeDuplicateRegexIndex = (arrayOfObjects) => arrayOfObjects.reduce((acc, obj) => {
    if (!acc.some(item => (item.regexIndex === obj.regexIndex) && (item.textSourceIndex === obj.textSourceIndex))) {
        acc.push(obj);
    }
    return acc;
}, []);


const sortDates = (dates) => {
    return dates.sort((a, b) => {
        return (a.textSourceIndex - b.textSourceIndex) ||
            (a.patternIndex - b.patternIndex) ||
            (a.regexIndex - b.regexIndex) ||
            (b.originalText.length - a.originalText.length) // b first because we want the longest text first
    })
}

export function findDates(subjectContent, mailContent) {
    const subjectContentDates = allDatesPatternByImportance.map(
        (aPattern, patternIndex) => findDatesByPattern(subjectContent, aPattern, {
            patternIndex,
            textSourceIndex: 0
        }))
    const mailContentDates = allDatesPatternByImportance.map(
        (aPattern, patternIndex) => findDatesByPattern(mailContent, aPattern, {
            patternIndex,
            textSourceIndex: 1
        }))

    const allFoundDates = [].concat(subjectContentDates, mailContentDates)
    const flatFoundDates = [].concat(...allFoundDates);
    const sortedFlatFoundDates = sortDates(flatFoundDates);
    return removeDuplicateRegexIndex(sortedFlatFoundDates)
}