import {findDates} from "../common/find_dates.js";


export async function tagMailContentDates(mailContentInnerHTML, mailContentPlainText) {
    const foundDates = findDates('', mailContentPlainText, false)
    let HTMLIndex = 0
    let foundHtmlElements = []

    foundDates.map((oneFoundDate) => {
        const originalDateText = oneFoundDate.originalDateTimeData.date.originalText

        const containerIdValue = `plugin-date-index-${HTMLIndex}`
        const dateContainerOpener =
            `<span id="${containerIdValue}" class="pluginMailToEvent-highlightDate">`

        const dateTextIndex = mailContentInnerHTML.indexOf(originalDateText)
        if (dateTextIndex !== -1) {
            let highlightLength = originalDateText.length

            const textToHighlight = mailContentInnerHTML.slice(dateTextIndex, dateTextIndex + highlightLength)

            const dateContainer = dateContainerOpener + textToHighlight + '</span>'

            // .replace(...) only changes the first occurrence
            mailContentInnerHTML = mailContentInnerHTML.replace(textToHighlight, dateContainer)
        }

        HTMLIndex += 1
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

