import {tagMailContentDates} from "./tag_dates.js";
import cssText from "../../create_event_button/pop_up_button.css";
import {createEventFormTop, createEventFormBottom} from "../../common/event_form.js";
import {populateCalendarSelector} from "../../common/calendar_selector.js";
import {populateTimezoneSelector} from "../../common/timezone_selector.js";

const style = document.createElement('style')
style.textContent = cssText
document.head.appendChild(style)

const activePopups = new Map()  // htmlContainerIdValue -> popupElement
const savedValues = new Map()   // htmlContainerIdValue -> {title, startDate, endDate, location, comment}

function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function makeDraggable(el) {
    let isDragging = false, startX, startY, startLeft, startTop
    const handle = el.querySelector('.pluginMailToEvent-drag-handle')
    handle.addEventListener('mousedown', (e) => {
        isDragging = true
        el.classList.add('pluginMailToEvent-event-creator--dragging')
        startX = e.clientX
        startY = e.clientY
        startLeft = parseInt(el.style.left) || 0
        startTop = parseInt(el.style.top) || 0
        e.preventDefault()
    })
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return
        el.style.left = (startLeft + e.clientX - startX) + 'px'
        el.style.top = (startTop + e.clientY - startY) + 'px'
    })
    document.addEventListener('mouseup', () => {
        isDragging = false
        el.classList.remove('pluginMailToEvent-event-creator--dragging')
    })
}

async function eventCreatorPopup(oneFoundElement) {
    const {htmlContainerIdValue, startDateTime, endDateTime} = oneFoundElement
    document.getElementById(htmlContainerIdValue).addEventListener('click', (clickEvent) => {
        if (activePopups.has(htmlContainerIdValue)) return

        const uid = generateUID()
        const eventCreator = document.createElement('div')
        eventCreator.id = `pluginMailToEvent-event-creator-${uid}`
        eventCreator.className = 'pluginMailToEvent-event-creator'

        const dragHandle = document.createElement('div')
        dragHandle.className = 'pluginMailToEvent-drag-handle'
        eventCreator.appendChild(dragHandle)

        const {fragment: topFragment, ids: topIds} = createEventFormTop(uid)
        const {fragment: bottomFragment, ids: bottomIds} = createEventFormBottom(uid)

        const startDateContainer = document.createElement('div')
        startDateContainer.className = 'form-group'
        const startDateLabel = document.createElement('label')
        startDateLabel.textContent = 'Start date'
        const startDateInput = document.createElement('input')
        startDateInput.id = `${uid}-start-date`
        startDateInput.type = 'datetime-local'
        startDateInput.value = startDateTime.dateISO.slice(0, 16)
        startDateContainer.appendChild(startDateLabel)
        startDateContainer.appendChild(startDateInput)

        const endDateContainer = document.createElement('div')
        endDateContainer.className = 'form-group'
        const endDateLabel = document.createElement('label')
        endDateLabel.textContent = 'End date'
        const endDateInput = document.createElement('input')
        endDateInput.id = `${uid}-end-date`
        endDateInput.type = 'datetime-local'
        endDateInput.value = endDateTime.dateISO.slice(0, 16)
        endDateContainer.appendChild(endDateLabel)
        endDateContainer.appendChild(endDateInput)

        const submitButton = document.createElement('input')
        submitButton.type = 'submit'
        submitButton.id = `${uid}-create-event`
        submitButton.className = 'pluginMailToEvent-create-btn'
        submitButton.value = 'Create event'

        eventCreator.appendChild(topFragment)
        eventCreator.appendChild(startDateContainer)
        eventCreator.appendChild(endDateContainer)
        eventCreator.appendChild(bottomFragment)
        eventCreator.appendChild(submitButton)

        const x = window.scrollX + clickEvent.clientX
        const y = window.scrollY + clickEvent.clientY
        eventCreator.style = `position: absolute; top: ${y}px; left: ${x}px`
        document.body.appendChild(eventCreator)
        activePopups.set(htmlContainerIdValue, eventCreator)

        // Restore saved values or set defaults
        const saved = savedValues.get(htmlContainerIdValue)
        if (saved) {
            document.getElementById(topIds.eventTitle).value = saved.title ?? document.title
            document.getElementById(`${uid}-start-date`).value = saved.startDate ?? startDateInput.value
            document.getElementById(`${uid}-end-date`).value = saved.endDate ?? endDateInput.value
            if (saved.location) document.getElementById(bottomIds.eventLocation).value = saved.location
            if (saved.comment) document.getElementById(bottomIds.eventComment).value = saved.comment
        } else {
            document.getElementById(topIds.eventTitle).value = document.title
        }

        eventCreator.addEventListener('input', () => {
            savedValues.set(htmlContainerIdValue, {
                title: document.getElementById(topIds.eventTitle)?.value,
                startDate: document.getElementById(`${uid}-start-date`)?.value,
                endDate: document.getElementById(`${uid}-end-date`)?.value,
                location: document.getElementById(bottomIds.eventLocation)?.value,
                comment: document.getElementById(bottomIds.eventComment)?.value,
            })
        })

        makeDraggable(eventCreator)

        populateCalendarSelector(
            document.getElementById(topIds.calendarSelector),
            document.getElementById(topIds.setDefaultCalendar),
            () => browser.runtime.sendMessage({action: 'getCalendars'})
        )

        populateTimezoneSelector(
            document.getElementById(topIds.timezoneSelector),
            document.getElementById(topIds.setDefaultTimezone)
        )

        submitButton.addEventListener('click', async () => {
            const selectedStartDate = document.getElementById(`${uid}-start-date`)?.value
            const selectedEndDate = document.getElementById(`${uid}-end-date`)?.value
            const title = document.getElementById(topIds.eventTitle).value
            const comment = document.getElementById(bottomIds.eventComment).value || ""
            const location = document.getElementById(bottomIds.eventLocation).value || ""
            const calendarId = document.getElementById(topIds.calendarSelector)?.value
            const timezone = document.getElementById(topIds.timezoneSelector)?.value

            if (selectedStartDate && selectedEndDate && title) {
                submitButton.disabled = true
                submitButton.value = 'Creating…'
                const result = await browser.runtime.sendMessage({
                    action: 'createCalendarEvent',
                    calendarId: calendarId,
                    args: [selectedStartDate + ':00', selectedEndDate + ':00', title, comment, timezone, location]
                })

                if (result.error) {
                    console.error(result)
                    submitButton.disabled = false
                    submitButton.value = "✗ " + (result.error?.message || "Error")
                    submitButton.classList.add("error")
                } else {
                    submitButton.value = "✓ Event created"
                    submitButton.classList.add("success")
                    savedValues.delete(htmlContainerIdValue)
                }
            }
        })

        eventCreator.addEventListener('mouseleave', () => {
            eventCreator.classList.add('pluginMailToEvent-event-creator--visited')
        }, {once: true})
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
        activePopups.forEach((popup, key) => {
            popup.remove()
            activePopups.delete(key)
        })
    }
})
