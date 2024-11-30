import {formatFoundDate} from "./format_dates.js";

const ddmmyyyyPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])[/-](?<year>\d{4})\b/gm;
const mmddyyyyPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])[/-](?<year>\d{4})\b/gm;
const yyyymmddPattern = /\b(?<year>\d{4})[/-](?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gm;
const ddmmPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])\b/gm;
const mmddPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gm;

const punctuationOrSpace = '\.|,|\\s|!'

const hhmmPattern = new RegExp(
    '(?<hours>([0|1|2]?[0-9])):(?<minutes>([0-9]{1,2}))(?<ampm>( (AM|PM)))?',
    'i')
const hhampmPattern = new RegExp(
    `[${punctuationOrSpace}](?<hours>([0|1|2]?[0-9])) (?<ampm>(AM|PM))`,
    'i')

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
    `(?<month>(${naturalMonthsRegex})).*(?<day>0[1-9]|[12][0-9]|3[01])[^0-9].*(?<year>\\d{4})?.*`,
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

const allHourPatterns = [hhmmPattern, hhampmPattern]

export const splitTextIntoSentences = (text) => {
    return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!|\n)\s*/);

}

function findDatesByPattern(text, pattern, extraData) {
    let matches = [];
    let matchAgainstDate, matchAgainstTime;
    const sentences = splitTextIntoSentences(text)

    sentences.map((oneSentence) => {
        while ((matchAgainstDate = pattern.exec(oneSentence)) !== null) {
            const dateMatch = {
                ...extraData,
                originalText: matchAgainstDate[0],
                regexIndex: matchAgainstDate.index,
                ...matchAgainstDate.groups
            }
            let matchesToAdd = []

            allHourPatterns.map(oneHourPattern => {
                matchAgainstTime = oneSentence.match(oneHourPattern)

                if (matchAgainstTime !== null) {
                    const timeGroup = matchAgainstTime.groups
                    matchesToAdd.push({
                        ...timeGroup,
                        ...dateMatch
                    })
                }
            })

            if (matchesToAdd.length === 0) {
                matchesToAdd.push(dateMatch)
            }
            matches = [].concat(matches, matchesToAdd)
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


const removeDuplicatesDateISO = (arrayOfObjects) => arrayOfObjects.reduce((acc, obj) => {
    if (!acc.some(item => (item.dateISO === obj.dateISO))) {
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
    const nonRegexDuplicated = removeDuplicateRegexIndex(sortedFlatFoundDates)

    const formatedDates = nonRegexDuplicated.map(formatFoundDate)
    const nonDuplicatedDates = removeDuplicatesDateISO(formatedDates)

    return nonDuplicatedDates
}