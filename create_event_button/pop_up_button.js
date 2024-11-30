import {findDates} from "./find_dates.js";
import "./pop_up_interaction.js";


const showFoundDates = (dates) => {
    const datesContainer = document.getElementById('dates-selector');

    dates.map((oneFoundDate) => {
        let container = document.createElement("div",)
        container.className = "one-date-selector"

        const dateInput = document.createElement('input');

        dateInput.className = "start-date-input"
        dateInput.type = 'datetime-local';
        dateInput.value = oneFoundDate.dateISO.slice(0,16)
        dateInput.fullValue = oneFoundDate.dateISO

        let selectOneDateInput = document.createElement('input');
        selectOneDateInput.type = "submit"
        selectOneDateInput.value = "select"
        selectOneDateInput.className = "submit-start-date"

        container.append(dateInput)
        container.append(selectOneDateInput)

        datesContainer.appendChild(container);
    })
}


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
    showFoundDates(dates)
}