import {formatFoundDate} from "./format_dates.js";
import extractDate from "../import/default-date.js";
import extractTime from "../import/default-time.js";

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

const endTExtToRemove = new RegExp(/[.!#]+$/gim)

const customExtractDateTimes = (text) => {
    const formatedText = text.replace(endTExtToRemove, '')
    const extractedDates = extractDate(formatedText, {
        minimumAge: 12,
        maximumAge: 12 * 20,
        direction: 'DM',
        locale: 'en'
    })

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

export function findDates(mailSubject, mailContent, removeDuplicatesDates = true) {
    const mailSubjectSentences = splitTextIntoSentences(mailSubject)
    const mailSubjectDates = mailSubjectSentences.map(customExtractDateTimes)

    const mailContentSentences = splitTextIntoSentences(mailContent)
    const mailContentDates = mailContentSentences.map(customExtractDateTimes)


    const allFoundDates = [].concat(mailSubjectDates, mailContentDates)
    const flatFoundDates = [].concat(...allFoundDates);

    const formatedDates = flatFoundDates.map(formatFoundDate)
    if (removeDuplicatesDates) {
        return removeDuplicatesDateISO(formatedDates)
    } else {
        return formatedDates
    }
}