function getElementByText(parentElement, text) {
    function searchText(element) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            for (let child of element.children) {
                const result = searchText(child);
                if (result) {
                    return result;
                }
            }
            if (element.textContent.includes(text)) {
                return element;
            }
        }
        return null;
    }

    return searchText(parentElement);
}

async function tagMailContentDates(document) {

    const mailContentPlainText = document.body.textContent;
    let mailContentInnerHTML = document.body.innerHTML;

    const foundDates = await browser.runtime.sendMessage({
        action: 'findDates',
        mailSubject: '',
        mailContentPlainText,
        removeDuplicatesDates: false,
    })
    let HTMLIndex = 0
    let foundHtmlElements = []

    foundDates.map((oneFoundDate) => {
        const originalDateText = oneFoundDate.originalDateTimeData.date.originalText

        const containerIdValue = `plugin-date-index-${HTMLIndex}`
        const dateContainerOpener =
            `<span id="${containerIdValue}" class="pluginMailToEvent-highlightDate">`

        const dateTextIndex = mailContentInnerHTML.indexOf(originalDateText)
        if (dateTextIndex !== -1) {
            const textAfterDate = mailContentInnerHTML.slice(dateTextIndex + originalDateText.length)

            const originalStartTimeText = oneFoundDate.originalDateTimeData?.startTime?.originalText
            const originalEndTimeText = oneFoundDate.originalDateTimeData?.endTime?.originalText

            const startTimeIndex = textAfterDate.indexOf(originalStartTimeText)
            const endTimeIndex = textAfterDate.indexOf(originalEndTimeText)

            let timeHighlightOffset = 0
            if (startTimeIndex !== -1 && startTimeIndex <= 50) {
                timeHighlightOffset = startTimeIndex + originalStartTimeText.length
            }
            if (endTimeIndex !== -1 && endTimeIndex <= 100) {
                timeHighlightOffset = Math.max(timeHighlightOffset,
                    endTimeIndex + originalEndTimeText.length)
            }

            const textToHighlight = mailContentInnerHTML.slice(dateTextIndex, dateTextIndex + originalDateText.length + timeHighlightOffset)

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

