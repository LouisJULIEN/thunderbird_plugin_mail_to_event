import {createEvent} from "./create_calendar_event.js";

const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})

const calendarSelector = document.getElementById("calendar-selector")
const setDefaultCheckbox = document.getElementById("set-default-calendar")

// Populate calendar dropdown
calendars.forEach((cal) => {
    const option = document.createElement("option")
    option.value = cal.id
    option.textContent = cal.name
    calendarSelector.appendChild(option)
})

// Restore saved default
const {defaultCalendarId} = await browser.storage.local.get("defaultCalendarId")
if (defaultCalendarId && calendars.some(c => c.id === defaultCalendarId)) {
    calendarSelector.value = defaultCalendarId
    setDefaultCheckbox.checked = true
}

// When checkbox changes, save or remove default
setDefaultCheckbox.addEventListener("change", async () => {
    if (setDefaultCheckbox.checked) {
        await browser.storage.local.set({defaultCalendarId: calendarSelector.value})
    } else {
        await browser.storage.local.remove("defaultCalendarId")
    }
})

// When dropdown changes while checkbox is checked, update stored default
calendarSelector.addEventListener("change", async () => {
    if (setDefaultCheckbox.checked) {
        await browser.storage.local.set({defaultCalendarId: calendarSelector.value})
    }
})

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

        if (selectedStartDate && selectedEndDate && title) {
            const result = await createEvent(
                calendarSelector.value,
                selectedStartDate + ':00.000Z',
                selectedEndDate + ':00.000Z',
                title,
                comment
            )

            if (result.error) {
                document.getElementById("creation-result-display").innerText = result.error?.message
                console.error(result)
            } else {
                document.getElementById("creation-result-display").innerText = "Event creation successful"
            }
        }
    })
