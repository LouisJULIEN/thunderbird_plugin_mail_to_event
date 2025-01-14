function getElementByText(parentElement, text) {
    function searchText(element) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            for (let child of element.childNodes) {
                const result = searchText(child);
                if (result) {
                    return result;
                }
            }
        }

        if (element.nodeType === Node.TEXT_NODE || element.nodeType === Node.ELEMENT_NODE) {
            const textIndex = element.textContent.toLowerCase().indexOf(text)

            if (textIndex !== -1) {
                return element;
            }
        }
        return null;
    }

    return searchText(parentElement);
}

async function tagMailContentDates(document) {
    const mailContentPlainText = document.body.textContent;

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

        const dateTextElement = getElementByText(document.body, originalDateText.toLowerCase())

        if (dateTextElement?.nodeType === Node.TEXT_NODE) {
            const originalText = dateTextElement.textContent

            const textIndex = originalText.toLowerCase().indexOf(originalDateText.toLowerCase())

            const originalStartTimeText = oneFoundDate.originalDateTimeData?.startTime?.originalText
            const originalEndTimeText = oneFoundDate.originalDateTimeData?.endTime?.originalText
            const startTimeIndex = originalText.toLowerCase().indexOf(originalStartTimeText)
            const endTimeIndex = originalText.toLowerCase().indexOf(originalEndTimeText)

            const startIndex = Math.max(textIndex, startTimeIndex, endTimeIndex)
            let endIndex = textIndex + +originalDateText.length;
            if (startTimeIndex > -1) {
                endIndex = Math.max(endIndex, startTimeIndex + originalStartTimeText.length)
            }
            if (endTimeIndex > -1) {
                endIndex = Math.max(endIndex, endTimeIndex + originalEndTimeText.length)
            }

            const spanModifiedText = document.createElement('span')

            const dateHighlightSpan = document.createElement('span')
            dateHighlightSpan.setAttribute('id', containerIdValue)
            dateHighlightSpan.setAttribute('class', 'pluginMailToEvent-highlightDate')

            dateHighlightSpan.textContent = originalText.slice(startIndex, endIndex)

            spanModifiedText.appendChild(document.createTextNode(originalText.slice(0, startIndex)))
            spanModifiedText.appendChild(dateHighlightSpan)
            spanModifiedText.appendChild(document.createTextNode(originalText.slice(endIndex)))

            dateTextElement.parentElement.replaceChild(spanModifiedText, dateTextElement)
        }

        HTMLIndex += 1
        foundHtmlElements.push({
            ...oneFoundDate,
            htmlContainerIdValue: containerIdValue
        })
    })
    return {
        foundHtmlElements
    }
}

