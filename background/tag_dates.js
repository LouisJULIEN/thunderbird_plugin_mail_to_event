import {findDates} from "../common/find_dates.js";

function findElementContainingText(rootElement, searchText) {
    const lowerCaseSearchText = searchText.toLowerCase();

    function traverse(element) {
        if (element.children.length === 0 && element.textContent && element.textContent.toLowerCase().includes(lowerCaseSearchText)) {
            return element;
        }
        for (let child of element.children) {
            const result = traverse(child);
            if (result) {
                return result;
            }
        }
        return null;
    }

    return traverse(rootElement);
}

export async function tagMailContentDates(mailContent) {
    const mailContentPlainText = mailContent.textContent || await messenger.messengerUtilities.convertToPlainText(mailContent)
    const foundDates = findDates('', mailContentPlainText, false)

    let dateIndex = 0
    let foundHtmlElements = []

    foundDates.map((oneFoundDate) => {
        const originalText = oneFoundDate.originalData.originalText
        const foundElement = findElementContainingText(mailContent, originalText)
        if (foundElement) {
            const containerIdValue = `plugin-date-index-${dateIndex}`
            const dateContainer =
                `<span id="${containerIdValue}" class="pluginMailToEvent-highlightDate">${originalText}</span>`

            // .replace(...) only changes the first occurrence
            foundElement.innerHTML = foundElement.innerHTML.replace(originalText, dateContainer)

            dateIndex += 1
            foundHtmlElements.push({
                ...oneFoundDate,
                htmlContainerIdValue: containerIdValue
            })
        }
    })
    return {
        modifiedMailContent: mailContent,
        foundHtmlElements
    }
}

