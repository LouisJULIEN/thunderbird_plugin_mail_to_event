import {findDates} from "./find_dates.js";

const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})

let tabs = await messenger.tabs.query({active: true, currentWindow: true});
const currentTabId = tabs[0].id;

let message = await messenger.messageDisplay.getDisplayedMessage(currentTabId);
if (!message) {
    const messages = await messenger.messageDisplay.getDisplayedMessages(currentTabId);
    message = messages?.[0]
}

if (message) {
    const subject = message.subject;
    const fullMessage = await messenger.messages.getFull(message.id);

    const dates = findDates(subject, "The meeting is scheduled for 12/25/2023. Another important date is 2024-01-15. Don't forget the anniversary on 05-12-2024 and the event on 2023/08/10.");
    document.getElementById("dates").textContent = dates.join('<br/>')
}
