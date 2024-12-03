import {createEvent} from "./create_calendar_event.js";

const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
const currentCalendar = calendars[0]

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

            const startDateValue = new Date(startDatePicker.fullValue)
            document.getElementById('selected-date-readable').innerText = startDateValue.toString()

            let endDateValue = new Date(Number(startDateValue))
            endDateValue.setMinutes(startDateValue.getMinutes() + 30)

            document.getElementById('end-date-input').value = endDateValue.toISOString().slice(0, 16)
            document.getElementById('end-date-input').fullValue = endDateValue.toISOString()
            document.getElementById('create-calendar-event').disabled = false
        }
    })


document.getElementById("create-calendar-event").addEventListener('click',
    async () => {
        const selectedStartDate = document.querySelector(".start-date-input[aria-selected='true']")?.fullValue
        const selectedEndDate = document.getElementById('end-date-input')?.fullValue
        const title = document.getElementById('event-title').value
        const comment = document.getElementById('event-comment').value || ""

        if (selectedStartDate && selectedEndDate && title) {
            const result = await createEvent(
                currentCalendar.id,
                selectedStartDate,
                selectedEndDate,
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
