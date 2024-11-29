import {findDates} from "./find_dates.js";
import {createEvent} from "./create_event.js";

const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
const currentCalendar = calendars[0]

let tabs = await messenger.tabs.query({active: true, currentWindow: true});
const currentTabId = tabs[0].id;

const messages = await messenger.messageDisplay.getDisplayedMessages(currentTabId);
const message = messages?.[0]


if (message) {
    const subject = message.subject;
    const fullMessage = await messenger.messages.getFull(message.id);

    const dates = findDates(subject, "The meeting is scheduled for 12/25/2023. Another important date is 2024-01-15. Don't forget the anniversary on 05-12-2024 and the event on 2023/08/10.");
    document.getElementById("dates").textContent = dates.join('<br/>')
}
createEvent(currentCalendar.id, {})