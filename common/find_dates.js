import {formatFoundDate} from "./format_dates.js";

const ddmmyyyyPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])[/-](?<year>\d{4})\b/gim;
const mmddyyyyPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])[/-](?<year>\d{4})\b/gim;
const yyyymmddPattern = /\b(?<year>\d{4})[/-](?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gim;
const ddmmPattern = /\b(?<day>0[1-9]|[12][0-9]|3[01])[/-](?<month>0[1-9]|1[0-2])\b/gim;
const mmddPattern = /\b(?<month>0[1-9]|1[0-2])[/-](?<day>0[1-9]|[12][0-9]|3[01])\b/gim;

const punctuationOrSpace = '\\.|,|\\s|!'

const hhmmPattern = new RegExp(
    '(?<hours>([012]?[0-9])):(?<minutes>([0-9]{1,2}))(?<ampm>( (AM|PM)))?',
    'gi')
const hhampmPattern = new RegExp(
    `[${punctuationOrSpace}](?<hours>([012]?[0-9])) (?<ampm>(AM|PM))`,
    'gi')

const naturalMonthsRegex = `` +
    `jan(u[a-z]*)?|` +
    `feb(r[a-z]*)?|` +
    `mar(c[a-z]*)?|` +
    `apr(i[a-z]*)?|` +
    `apr(i[a-z]*)?|` +
    `may|` +
    `jun(e[a-z]*)?|` +
    `jul(y[a-z]*)?|` +
    `aug(u[a-z]*)?|` +
    `sep(t[a-z]*)?|` +
    `oct(o[a-z]*)?|` +
    `nov(e[a-z]*)?|` +
    `dec(e[a-z]*)?` +
    ``

export const ddmonthPattern = new RegExp(
    `(?<day>((0?[1-9])|([12][0-9])|(3[01])))[^0-9]{1,5}?(?<month>(${naturalMonthsRegex}))` +
    `($|${punctuationOrSpace})([^0-9]*?(?<year>\\d{4}))?`,
    'gim'
)

const monthddPattern = new RegExp(
    `(?<month>(${naturalMonthsRegex}))(${punctuationOrSpace})+(?<day>((0?[1-9])|([12][0-9])|(3[01])))` +
    `($|${punctuationOrSpace})([^0-9]*?(?<year>\\d{4}))?`,
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

    let totalIndices = 0
    for (const oneSentence of sentences) {
        while ((matchAgainstDate = pattern.exec(oneSentence)) !== null) {
            const dateMatch = {
                ...extraData,
                originalText: matchAgainstDate[0],
                regexIndex: totalIndices + matchAgainstDate.index,
                ...matchAgainstDate.groups
            }
            let matchesToAdd = []

            allHourPatterns.map(oneHourPattern => {
                matchAgainstTime = oneHourPattern.exec(oneSentence)
                if (matchAgainstTime !== null) {
                    const timeGroup = matchAgainstTime.groups
                    matchesToAdd.push({
                        ...timeGroup,
                        ...dateMatch
                    })
                }
                oneHourPattern.lastIndex = 0// resets so the pattern can be reused later
            })

            if (matchesToAdd.length === 0) {
                matchesToAdd.push(dateMatch)
            }
            matches = [].concat(matches, matchesToAdd)
        }
        totalIndices += oneSentence.length
        pattern.lastIndex = 0 // resets so the pattern can be reused later
    }
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

export function findDates(mailSubject, mailContent, removeDuplicatesDates = true) {
    const subjectContentDates = allDatesPatternByImportance.map(
        (aPattern, patternIndex) => findDatesByPattern(mailSubject, aPattern, {
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
    if (removeDuplicatesDates) {
        return removeDuplicatesDateISO(formatedDates)
    } else {
        return formatedDates
    }
}