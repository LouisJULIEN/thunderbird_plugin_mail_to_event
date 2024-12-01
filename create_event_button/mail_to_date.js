import {findDates} from "./find_dates.js";

export async function getCurrentMailDates() {
    let tabs = await messenger.tabs.query({active: true, currentWindow: true});
    const currentTabId = tabs[0].id;

    const messages = await messenger.messageDisplay.getDisplayedMessages(currentTabId);
    const message = messages.messages?.[0]

    if (message) {
        const subject = message.subject;
        document.getElementById("event-title").value = subject
        const emailBodyTextInline = await messenger.messages.listInlineTextParts(message.id)
        const emailBodyText = await messenger.messengerUtilities.convertToPlainText(emailBodyTextInline[0].content)

        const dates = findDates(subject, emailBodyText);
        return dates
    }
}