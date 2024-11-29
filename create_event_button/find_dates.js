const mmddyyyyPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])[/-](?<year>\d{4})\b/g;
const ddmmyyyyPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])[/-](?<year>\d{4})\b/g;
const yyyymmddPattern = /\b(?<year>\d{4})[/-](?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/g;
const mmddPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/g;
const ddmmPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])\b/g;


const allDatesPatternByImportance = [
    ddmmyyyyPattern,
    mmddyyyyPattern,
    yyyymmddPattern,
    ddmmPattern,
    mmddPattern
]

function findDatesByPattern(text, pattern, extraData) {
    let matches = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
        matches.push({
            ...extraData,
            originalText: match[0],
            regexIndex: match.index,
            ...match.groups
        });
    }
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
    console.log(allFoundDates)
    const flatFoundDates = [].concat(...allFoundDates);
    const sortedFlatFoundDates = sortDates(flatFoundDates);
    const filteredDates = removeDuplicateRegexIndex(sortedFlatFoundDates)

    console.log(filteredDates)
    return filteredDates;
}

console.log(messenger.calendar)