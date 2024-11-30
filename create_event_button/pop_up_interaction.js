import {createEvent} from "./create_event.js";

let differenceStartDateEndDate = 1000 * 60 * 30 // 30 minutes

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

            const startDateValue = new Date(startDatePicker.value)
            document.getElementById('selected-date-readable').innerText = startDateValue.toString()

            const endDateValue = new Date((startDateValue).getTime() + differenceStartDateEndDate)

            const month = ("0" + endDateValue.getMonth()).slice(-2)
            const day = ("0" + endDateValue.getDate()).slice(-2)
            const hours = ("0" + endDateValue.getHours()).slice(-2)
            const minutes = ("0" + endDateValue.getMinutes()).slice(-2)
            const endDateValueFormated = `${endDateValue.getFullYear()}-${month}-${day} ${hours}:${minutes}`
            document.getElementById('end-date-input').value = endDateValueFormated
            document.getElementById('create-calendar-event').disabled = false
        }
    })


document.getElementById("create-calendar-event").addEventListener('click',
    async () => {
        const selectedStartDate = document.querySelector(".start-date-input[aria-selected='true']")?.value
        const selectedEndDate = document.getElementById('end-date-input').value
        const title = document.getElementById('event-title').value
        const comment = document.getElementById('event-comment').value || ""

        if (selectedStartDate && selectedEndDate && title) {

            const formatedStartDate = (new Date(selectedStartDate)).toISOString()
            const formatedEndDate = (new Date(selectedEndDate)).toISOString()

            const result = await createEvent(currentCalendar.id, formatedStartDate, formatedEndDate, title, comment)
            if (result.error) {
                document.getElementById("creation-result-display").innerText = result.error?.message
            } else {
                document.getElementById("creation-result-display").innerText = "Event creation successful"
            }
        }
    })
