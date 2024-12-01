import {findDates} from "../common/find_dates.js";


export async function tagMailContentDates(mailContentInnerHTML, mailContentPlainText) {
    const foundDates = findDates('', mailContentPlainText, false)
    let dateIndex = 0
    let foundHtmlElements = []

    foundDates.map((oneFoundDate) => {
        const originalText = oneFoundDate.originalData.originalText

        const containerIdValue = `plugin-date-index-${dateIndex}`
        const dateContainer =
            `<span id="${containerIdValue}" class="pluginMailToEvent-highlightDate">${originalText}</span>`

        // .replace(...) only changes the first occurrence
        mailContentInnerHTML = mailContentInnerHTML.replace(originalText, dateContainer)

        dateIndex += 1
        foundHtmlElements.push({
            ...oneFoundDate,
            htmlContainerIdValue: containerIdValue
        })
    })
    return {
        modifiedMailInnerHTML: mailContentInnerHTML,
        foundHtmlElements
    }
}

