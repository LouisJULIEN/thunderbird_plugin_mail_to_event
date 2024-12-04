import {formatFoundDate} from "./format_dates.js";
import extractDate from "../import/default-date.js";

export const splitTextIntoSentences = (text) => {
    return text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!|\n)\s*/);

}

const removeDuplicatesDateISO = (arrayOfObjects) => arrayOfObjects.reduce((acc, obj) => {
    if (!acc.some(item => (item.dateISO === obj.dateISO))) {
        acc.push(obj);
    }
    return acc;
}, []);

const endTExtToRemove = new RegExp(/[.!#]+$/gim)

const customExtractDateAndTime = (text) => {
    const formatedText = text.replace(endTExtToRemove, '')
    const extractedDate = extractDate(formatedText, {minimumAge: 12, maximumAge: 12 * 20, direction: 'DM', locale:'en'})
    console.log({formatedText, extractedDate})
    return extractedDate
}

export function findDates(mailSubject, mailContent, removeDuplicatesDates = true) {
    const mailSubjectSentences = splitTextIntoSentences(mailSubject)
    const mailSubjectDates = mailSubjectSentences.map(customExtractDateAndTime)

    const mailContentSentences = splitTextIntoSentences(mailContent)
    const mailContentDates = mailContentSentences.map(customExtractDateAndTime)


    const allFoundDates = [].concat(mailSubjectDates, mailContentDates)
    const flatFoundDates = [].concat(...allFoundDates);

    const formatedDates = flatFoundDates.map(formatFoundDate)
    if (removeDuplicatesDates) {
        return removeDuplicatesDateISO(formatedDates)
    } else {
        return formatedDates
    }
}