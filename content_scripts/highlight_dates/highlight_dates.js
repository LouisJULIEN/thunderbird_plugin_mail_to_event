import {tagMailContentDates} from "./tag_dates.js";
import {createEventFormTop, createEventFormBottom} from "../../common/event_form.js";
import {populateCalendarSelector} from "../../common/calendar_selector.js";
import {populateTimezoneSelector} from "../../common/timezone_selector.js";

let createdDivIds = []

function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function eventCreatorPopup(oneFoundElement) {
    const {htmlContainerIdValue, startDateTime, endDateTime} = oneFoundElement
    document.getElementById(htmlContainerIdValue).addEventListener('click', (clickEvent) => {
        const uid = generateUID()
        const eventCreator = document.createElement('div')
        eventCreator.id = `pluginMailToEvent-event-creator-${uid}`
        eventCreator.className = `pluginMailToEvent-event-creator`

        const {fragment: topFragment, ids: topIds} = createEventFormTop(uid)
        const {fragment: bottomFragment, ids: bottomIds} = createEventFormBottom(uid)

        // Start date (content-script specific — pre-filled from clicked element)
        const startDateContainer = document.createElement('div')
        startDateContainer.className = 'one-date-selector'
        const startDateLabel = document.createElement('label')
        startDateLabel.textContent = 'Start date'
        const startDateInput = document.createElement('input')
        startDateInput.id = `${uid}-start-date`
        startDateInput.type = 'datetime-local'
        startDateInput.value = startDateTime.dateISO.slice(0, 16)
        startDateContainer.appendChild(startDateLabel)
        startDateContainer.appendChild(document.createElement('br'))
        startDateContainer.appendChild(startDateInput)

        // End date
        const endDateContainer = document.createElement('div')
        endDateContainer.className = 'one-date-selector'
        const endDateLabel = document.createElement('label')
        endDateLabel.textContent = 'End date'
        const endDateInput = document.createElement('input')
        endDateInput.id = `${uid}-end-date`
        endDateInput.type = 'datetime-local'
        endDateInput.value = endDateTime.dateISO.slice(0, 16)
        endDateContainer.appendChild(endDateLabel)
        endDateContainer.appendChild(document.createElement('br'))
        endDateContainer.appendChild(endDateInput)

        // Result display + submit button
        const resultDisplay = document.createElement('div')
        resultDisplay.id = `${uid}-result`

        const submitButton = document.createElement('input')
        submitButton.type = 'submit'
        submitButton.id = `${uid}-create-event`
        submitButton.value = 'Create event'

        // Assemble: top fields → dates → bottom fields → result → button
        eventCreator.appendChild(topFragment)
        eventCreator.appendChild(startDateContainer)
        eventCreator.appendChild(endDateContainer)
        eventCreator.appendChild(bottomFragment)
        eventCreator.appendChild(resultDisplay)
        eventCreator.appendChild(submitButton)

        const x = window.scrollX + clickEvent.clientX
        const y = window.scrollY + clickEvent.clientY
        eventCreator.style = `position: absolute; top: ${y}px; left: ${x}px`
        document.body.appendChild(eventCreator)
        createdDivIds.push(eventCreator.id)

        document.getElementById(topIds.eventTitle).value = document.title

        populateCalendarSelector(
            document.getElementById(topIds.calendarSelector),
            document.getElementById(topIds.setDefaultCalendar),
            () => browser.runtime.sendMessage({action: 'getCalendars'})
        )

        populateTimezoneSelector(
            document.getElementById(topIds.timezoneSelector),
            document.getElementById(topIds.setDefaultTimezone)
        )

        document.getElementById(`${uid}-create-event`).addEventListener('click', async () => {
            const selectedStartDate = document.getElementById(`${uid}-start-date`)?.value
            const selectedEndDate = document.getElementById(`${uid}-end-date`)?.value
            const title = document.getElementById(topIds.eventTitle).value
            const comment = document.getElementById(bottomIds.eventComment).value || ""
            const location = document.getElementById(bottomIds.eventLocation).value || ""
            const calendarId = document.getElementById(topIds.calendarSelector)?.value
            const timezone = document.getElementById(topIds.timezoneSelector)?.value

            if (selectedStartDate && selectedEndDate && title) {
                const result = await browser.runtime.sendMessage({
                    action: 'createCalendarEvent',
                    calendarId: calendarId,
                    args: [selectedStartDate + ':00', selectedEndDate + ':00', title, comment, timezone, location]
                })

                if (result.error) {
                    document.getElementById(`${uid}-result`).innerText = result.error?.message
                    console.error(result)
                } else {
                    document.getElementById(`${uid}-result`).innerText = "Event creation successful"
                }
            }
        })
    })
}

async function highlightEmailDates() {
    const res = await tagMailContentDates(document)
    res.foundHtmlElements.map(eventCreatorPopup)
}

highlightEmailDates()

document.addEventListener('click', function (clickEvent) {
    const clickedOnAnEventCreator = clickEvent.target.closest('.pluginMailToEvent-event-creator') ||
        clickEvent.target.closest('.pluginMailToEvent-highlightDate')

    if (!clickedOnAnEventCreator) {
        while (createdDivIds.length > 0) {
            const oneEventCreatorId = createdDivIds.pop()
            document.getElementById(oneEventCreatorId).remove()
        }
    }
})
