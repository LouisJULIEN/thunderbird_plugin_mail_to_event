import {findDates} from "./find_dates.js";

export async function getCurrentMailDates() {
    let tabs = await messenger.tabs.query({active: true, currentWindow: true});
    const currentTab = tabs[0];
    const currentTabId = currentTab.id;

    const messages = await messenger.messageDisplay.getDisplayedMessages(currentTabId);
    const message = messages.messages?.[0]

    if (message) {
        const subject = message.subject;
        const messageId = message.id
        const emailBodyTextInline = await messenger.messages.listInlineTextParts(messageId)
        const emailBodyText = await messenger.messengerUtilities.convertToPlainText(emailBodyTextInline[0].content)

        const dates = findDates(subject, emailBodyText);
        return {dates, subject, messageId}
    }
}