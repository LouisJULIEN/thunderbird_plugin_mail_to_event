import {findDates} from "./find_dates.js";
import {formatFoundDate} from "./format_dates.js";
import * as f from "./pop_up_interaction.js";

const addDates = (dates) => {
    const datesContainer = document.getElementById('dates-container');

    dates.map((oneFoundDate) => {
        const formatedDate = formatFoundDate(oneFoundDate)
        const dateInput = document.createElement('input');

        let oneDateChoice = `${formatedDate.year}-${formatedDate.month}-${formatedDate.day}`
        let dateInputTye = 'date';

        if (formatedDate.hours) {
            oneDateChoice += ` ${formatedDate.hours}:${formatedDate.minutes}`
            dateInputTye = 'datetime-local';
        }

        dateInput.type = dateInputTye;
        dateInput.value = oneDateChoice

        datesContainer.appendChild(dateInput);
    })
}


const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
const currentCalendar = calendars[0]

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

    addDates(dates)
}