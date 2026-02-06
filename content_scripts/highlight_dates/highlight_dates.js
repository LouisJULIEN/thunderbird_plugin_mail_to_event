// import {tagMailContentDates} from "./tag_dates.js"; injected via register_content_script_injector.js

let createdDivIds = []

function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const createEventHTML = (uniqueID) => {
    const tagsId = {
        startDate: `pluginMailToEvent-start-date-input-${uniqueID}`,
        endDate: `pluginMailToEvent-end-date-input-${uniqueID}`,
        eventComment: `pluginMailToEvent-event-comment-${uniqueID}`,
        eventTitle: `pluginMailToEvent-event-title-${uniqueID}`,
        resultDisplay: `pluginMailToEvent-creation-result-display-${uniqueID}`,
        submitEventCreation: `pluginMailToEvent-create-calendar-event-${uniqueID}`,
        calendarSelector: `pluginMailToEvent-calendar-selector-${uniqueID}`,
        setDefaultCalendar: `pluginMailToEvent-set-default-calendar-${uniqueID}`,
    }

    const br = document.createElement('br');


    const container = document.createElement('div');
    container.className = 'pluginMailToEvent-createEvent';

    const eventTitleInput = document.createElement('input');
    eventTitleInput.type = 'text';
    eventTitleInput.id = tagsId.eventTitle;
    container.appendChild(eventTitleInput);

    // Calendar selector section
    const calendarSection = document.createElement('div');
    calendarSection.className = 'pluginMailToEvent-calendarSection';

    const calendarSelect = document.createElement('select');
    calendarSelect.id = tagsId.calendarSelector;
    calendarSection.appendChild(calendarSelect);

    const defaultLabel = document.createElement('label');
    const defaultCheckbox = document.createElement('input');
    defaultCheckbox.type = 'checkbox';
    defaultCheckbox.id = tagsId.setDefaultCalendar;
    defaultLabel.appendChild(defaultCheckbox);
    defaultLabel.appendChild(document.createTextNode(' Set as default'));
    calendarSection.appendChild(defaultLabel);

    container.appendChild(calendarSection);

    const startDateSelector = document.createElement('div');
    startDateSelector.className = 'start-date-selector one-date-selector';

    const startDateLabel = document.createElement('label');
    startDateLabel.htmlFor = 'start-date-input';
    startDateLabel.textContent = 'Start date';
    startDateSelector.appendChild(startDateLabel);
    startDateSelector.appendChild(br.cloneNode());

    const startDateInput = document.createElement('input');
    startDateInput.id = tagsId.startDate;
    startDateInput.type = 'datetime-local';
    startDateInput.value = '';
    startDateSelector.appendChild(startDateInput);

    container.appendChild(startDateSelector);


    const endDateSelector = document.createElement('div');
    endDateSelector.className = 'end-date-selector one-date-selector';

    const endDateLabel = document.createElement('label');
    endDateLabel.htmlFor = 'end-date-input';
    endDateLabel.textContent = 'End date';
    endDateSelector.appendChild(endDateLabel);
    endDateSelector.appendChild(br.cloneNode());

    const endDateInput = document.createElement('input');
    endDateInput.id = tagsId.endDate;
    endDateInput.type = 'datetime-local';
    endDateInput.value = '';
    endDateSelector.appendChild(endDateInput);

    container.appendChild(endDateSelector);
    container.appendChild(br.cloneNode());

    const eventCommentTextarea = document.createElement('textarea');
    eventCommentTextarea.rows = '2';
    eventCommentTextarea.cols = '30';
    eventCommentTextarea.id = tagsId.eventComment;
    eventCommentTextarea.placeholder = 'Optional description';
    container.appendChild(eventCommentTextarea);

    const resultDisplayDiv = document.createElement('div');
    resultDisplayDiv.id = tagsId.resultDisplay;
    container.appendChild(resultDisplayDiv);

    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.id = tagsId.submitEventCreation;
    submitButton.value = 'Create event';
    container.appendChild(submitButton);

    return {tagsId, container}
}

async function populateCalendarSelector(tagsId) {
    const calendars = await browser.runtime.sendMessage({action: 'getCalendars'})
    const calendarSelect = document.getElementById(tagsId.calendarSelector)
    const defaultCheckbox = document.getElementById(tagsId.setDefaultCalendar)

    calendars.forEach((cal) => {
        const option = document.createElement('option')
        option.value = cal.id
        option.textContent = cal.name
        calendarSelect.appendChild(option)
    })

    const {defaultCalendarId} = await browser.storage.local.get("defaultCalendarId")
    if (defaultCalendarId && calendars.some(c => c.id === defaultCalendarId)) {
        calendarSelect.value = defaultCalendarId
        defaultCheckbox.checked = true
    }

    defaultCheckbox.addEventListener("change", async () => {
        if (defaultCheckbox.checked) {
            await browser.storage.local.set({defaultCalendarId: calendarSelect.value})
        } else {
            await browser.storage.local.remove("defaultCalendarId")
        }
    })

    calendarSelect.addEventListener("change", async () => {
        if (defaultCheckbox.checked) {
            await browser.storage.local.set({defaultCalendarId: calendarSelect.value})
        }
    })
}

const submitEventCreation = async (tagsId) => {
    const selectedStartDate = document.getElementById(tagsId.startDate)?.value
    const selectedEndDate = document.getElementById(tagsId.endDate)?.value
    const title = document.getElementById(tagsId.eventTitle).value
    const comment = document.getElementById(tagsId.eventComment).value || ""
    const calendarId = document.getElementById(tagsId.calendarSelector)?.value
    if (selectedStartDate && selectedEndDate && title) {
        const result = await browser.runtime.sendMessage({
            action: 'createCalendarEvent',
            calendarId: calendarId,
            args: [
                selectedStartDate + ':00.000Z',
                selectedEndDate + ':00.000Z',
                title,
                comment]
        })

        if (result.error) {
            document.getElementById(tagsId.resultDisplay).innerText = result.error?.message
            console.error(result)
        } else {
            document.getElementById(tagsId.resultDisplay).innerText = "Event creation successful"
        }
    }
}

async function eventCreatorPopup(oneFoundElement) {
    const {htmlContainerIdValue, startDateTime, endDateTime} = oneFoundElement
    document.getElementById(htmlContainerIdValue).addEventListener('click', (clickEvent) => {
        const uid = generateUID()
        const eventCreator = document.createElement('div')
        eventCreator.id = `pluginMailToEvent-event-creator-${uid}`
        eventCreator.className = `pluginMailToEvent-event-creator`

        const {container, tagsId} = createEventHTML(uid)
        eventCreator.appendChild(container)
        const x = window.scrollX + clickEvent.clientX
        const y = window.scrollY + clickEvent.clientY
        eventCreator.style = `position: absolute; top: ${y}px; left: ${x}px`
        document.body.appendChild(eventCreator)
        createdDivIds.push(eventCreator.id)

        document.getElementById(tagsId.eventTitle).value = document.title
        document.getElementById(tagsId.startDate).value = startDateTime.dateISO.slice(0, 16)
        document.getElementById(tagsId.endDate).value = endDateTime.dateISO.slice(0, 16)

        populateCalendarSelector(tagsId)

        document.getElementById(tagsId.submitEventCreation).addEventListener('click', () => submitEventCreation(tagsId))
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
