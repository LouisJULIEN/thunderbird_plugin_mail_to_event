import {createEventFormTop, createEventFormBottom} from "../common/event_form.js";
import {getCurrentMailDates} from "./current_mail_to_date.js";

// Insert top fields (title, calendar, timezone) before the dates selector
const {fragment: topFragment} = createEventFormTop()
const datesSelector = document.getElementById('dates-selector')
datesSelector.parentNode.insertBefore(topFragment, datesSelector)

// Insert bottom fields (location, description) before the create button
const {fragment: bottomFragment} = createEventFormBottom()
const createBtn = document.getElementById('create-calendar-event')
createBtn.parentNode.insertBefore(bottomFragment, createBtn)

// Import interaction only after form fields are in the DOM
await import("./pop_up_interaction.js")

const showFoundDates = (dates) => {
    const datesContainer = document.getElementById('dates-selector');

    dates.map((oneFoundDate) => {
        let container = document.createElement("div",)
        container.className = "one-date-selector"

        const dateInput = document.createElement('input');

        dateInput.className = "start-date-input"
        dateInput.type = 'datetime-local';
        dateInput.value = oneFoundDate.startDateTime.dateISO.slice(0, 16)
        dateInput.endDate = oneFoundDate.endDateTime.dateISO.slice(0, 16)

        let selectOneDateInput = document.createElement('input');
        selectOneDateInput.type = "submit"
        selectOneDateInput.value = "select"
        selectOneDateInput.className = "submit-start-date"

        container.append(dateInput)
        container.append(selectOneDateInput)

        datesContainer.appendChild(container);
    })
}

const {dates, subject, detectedLanguage} = await getCurrentMailDates()
document.getElementById("event-title").value = subject
if (detectedLanguage) {
    document.getElementById("detected-language").textContent = detectedLanguage
}
if (dates) {
    showFoundDates(dates)
}

// Restore saved values (overrides auto-detected subject if user had previously typed something)
const {savedPopupValues} = await browser.storage.local.get('savedPopupValues')
if (savedPopupValues) {
    if (savedPopupValues.title) document.getElementById('event-title').value = savedPopupValues.title
    if (savedPopupValues.location) document.getElementById('event-location').value = savedPopupValues.location
    if (savedPopupValues.comment) document.getElementById('event-comment').value = savedPopupValues.comment
}

document.querySelector('.pluginMailToEvent-event-creator').addEventListener('input', async () => {
    await browser.storage.local.set({savedPopupValues: {
        title: document.getElementById('event-title')?.value,
        location: document.getElementById('event-location')?.value,
        comment: document.getElementById('event-comment')?.value,
    }})
})
