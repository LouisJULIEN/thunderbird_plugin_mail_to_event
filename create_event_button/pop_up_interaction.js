import {createEvent} from "./create_calendar_event.js";
import {populateCalendarSelector} from "../common/calendar_selector.js";
import {populateTimezoneSelector} from "../common/timezone_selector.js";

const calendarSelector = document.getElementById("calendar-selector")
const setDefaultCheckbox = document.getElementById("set-default-calendar")

await populateCalendarSelector(
    calendarSelector,
    setDefaultCheckbox,
    () => messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
)

const timezoneSelector = document.getElementById("timezone-selector")
const setDefaultTimezoneCheckbox = document.getElementById("set-default-timezone")

await populateTimezoneSelector(timezoneSelector, setDefaultTimezoneCheckbox)

const resetAriaSelected = () => {
    Array.from(document.getElementsByClassName('start-date-input')).forEach((e) => {
        e.ariaSelected = "false"
    })
}

document.getElementById("dates-selector").addEventListener('click',
    (clickedElement) => {
        if (clickedElement.target.className === "submit-start-date") {
            resetAriaSelected()

            const startDatePicker = clickedElement.target.parentElement.getElementsByClassName('start-date-input')?.[0];
            startDatePicker.ariaSelected = "true"

            document.getElementById('end-date-input').value = startDatePicker.endDate
            document.getElementById('create-calendar-event').disabled = false
        }
    })


document.getElementById("create-calendar-event").addEventListener('click',
    async () => {
        const selectedStartDate = document.querySelector(".start-date-input[aria-selected='true']")?.value
        const selectedEndDate = document.getElementById('end-date-input')?.value
        const title = document.getElementById('event-title').value
        const comment = document.getElementById('event-comment').value || ""
        const location = document.getElementById('event-location').value || ""
        const btn = document.getElementById("create-calendar-event")

        if (selectedStartDate && selectedEndDate && title) {
            btn.disabled = true
            btn.textContent = 'Creating…'

            const result = await createEvent(
                calendarSelector.value,
                selectedStartDate + ':00',
                selectedEndDate + ':00',
                title,
                comment,
                timezoneSelector.value,
                location
            )

            if (result.error) {
                console.error(result)
                btn.textContent = "✗ " + (result.error?.message || "Error")
                btn.classList.add("error")
                btn.disabled = false
            } else {
                btn.textContent = "✓ Event created"
                btn.classList.add("success")
            }
        }
    })
