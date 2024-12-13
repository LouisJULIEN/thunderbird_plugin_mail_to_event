import {formatFoundDate} from "./format_dates.js";
import extractDate from "../import/default-date.js";
import extractTime from "../import/default-time.js";
import {franc} from "../dependencies/franc.js";
import {francLocaleToDateFnsLocale} from "./franc_locale_to_extract_date_locale.js";

export const splitTextIntoSentences = (text) => {
    return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!|\n)\s*/);
}

const removeDuplicatesDateISO = (arrayOfObjects) => arrayOfObjects.reduce((acc, obj) => {
    if (!acc.some(item => (
        item.startDateTime.dateISO === obj.startDateTime.dateISO &&
        item.endDateTime.dateISO === obj.endDateTime.dateISO
    ))) {
        acc.push(obj);
    }
    return acc;
}, []);


const customExtractDateTimes = (text, options) => {
    const extractedDates = extractDate(text, options)
    console.log(extractedDates)

    const extractedDateTimes = extractedDates.map((oneExtractedDate) => {
        const dateStartingPoint = text.indexOf(oneExtractedDate.originalText)
        if (dateStartingPoint !== -1) {
            const sentenceAfterDate = text.slice(dateStartingPoint + oneExtractedDate.originalText.length)
            const timesAfterDate = extractTime(sentenceAfterDate)

            if (timesAfterDate.length >= 2 && timesAfterDate[0].time < timesAfterDate[1].time) {
                return {
                    date: oneExtractedDate,
                    startTime: timesAfterDate[0],
                    endTime: timesAfterDate[1]
                }
            } else if (timesAfterDate.length >= 1) {
                return {
                    date: oneExtractedDate,
                    startTime: timesAfterDate[0]
                }
            }
        }

        return {
            date: oneExtractedDate
        }
    })

    return extractedDateTimes
}

const detectLang = (text) => {
    const langFranc = franc(text, {only: Object.keys(francLocaleToDateFnsLocale)})
    return francLocaleToDateFnsLocale[langFranc] || 'en'
}

export function findDates(mailSubject, mailContent, removeDuplicatesDates = true) {

    const detectedLangDateFNS = detectLang(mailSubject + '.\n' + mailContent)
    console.log(detectedLangDateFNS)

    const options = {
        minimumAge: 12,
        maximumAge: 12 * 20,
        direction: 'DM',
        locale: detectedLangDateFNS
    }

    const mailSubjectSentences = splitTextIntoSentences(mailSubject)
    const mailSubjectDates = mailSubjectSentences.map(e => customExtractDateTimes(e, options))

    const mailContentSentences = splitTextIntoSentences(mailContent)
    const mailContentDates = mailContentSentences.map(e => customExtractDateTimes(e, options))


    const allFoundDates = [].concat(mailSubjectDates, mailContentDates)
    console.log(allFoundDates)
    const flatFoundDates = [].concat(...allFoundDates);

    const formatedDates = flatFoundDates.map(formatFoundDate)
    if (removeDuplicatesDates) {
        return removeDuplicatesDateISO(formatedDates)
    } else {
        return formatedDates
    }
}