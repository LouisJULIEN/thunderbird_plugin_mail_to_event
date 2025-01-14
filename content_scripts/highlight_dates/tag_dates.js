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
                return {element, textIndex};
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

        const {element: dateTextElement, textIndex} = getElementByText(document.body, originalDateText.toLowerCase())
        if (dateTextElement) {
            if (dateTextElement.nodeType === Node.TEXT_NODE) {
                const originalText = dateTextElement.textContent

                const spanModifiedText = document.createElement('span')

                const dateHighlightSpan = document.createElement('span')
                dateHighlightSpan.setAttribute('id', containerIdValue)
                dateHighlightSpan.setAttribute('class', 'pluginMailToEvent-highlightDate')

                dateHighlightSpan.textContent = originalText.slice(textIndex, textIndex + originalDateText.length)

                spanModifiedText.appendChild(document.createTextNode(originalText.slice(0, textIndex)))
                spanModifiedText.appendChild(dateHighlightSpan)
                spanModifiedText.appendChild(document.createTextNode(originalText.slice(textIndex + originalDateText.length)))

                dateTextElement.parentElement.replaceChild(spanModifiedText, dateTextElement)
            }
            else if  (dateTextElement.nodeType === Node.ELEMENT_NODE) {
                throw "not handled yet"
            }
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

