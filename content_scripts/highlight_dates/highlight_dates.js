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
    }

    const html = `
<div class="pluginMailToEvent-createEvent">
<textarea rows="1" cols="30" id="${tagsId.eventTitle}"></textarea>

<div class="start-date-selector one-date-selector">
    <label for="start-date-input">Start date</label><br/>
    <input id="${tagsId.startDate}" type="datetime-local" value="">
</div>

<div class="end-date-selector one-date-selector">
    <label for="end-date-input">End date</label><br/>
    <input id="${tagsId.endDate}" type="datetime-local" value="">
</div>
<br/>

<textarea rows="2" cols="30" id="${tagsId.eventComment}" placeholder="Optional description"></textarea>


<div id="${tagsId.resultDisplay}"></div>
<input type="submit" id="${tagsId.submitEventCreation}" value="Create event">
</div>
`
    return {tagsId, html}
}

const submitEventCreation = async (tagsId) => {
    const selectedStartDate = document.getElementById(tagsId.startDate)?.value
    const selectedEndDate = document.getElementById(tagsId.endDate)?.value
    const title = document.getElementById(tagsId.eventTitle).value
    const comment = document.getElementById(tagsId.eventComment).value || ""
    if (selectedStartDate && selectedEndDate && title) {
        const result = await browser.runtime.sendMessage({
            action: 'createCalendarEvent',
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

        const {html, tagsId} = createEventHTML(uid)
        eventCreator.innerHTML = html
        const x = window.scrollX + clickEvent.clientX
        const y = window.scrollY + clickEvent.clientY
        eventCreator.style = `position: absolute; top: ${y}px; left: ${x}px`
        document.body.appendChild(eventCreator)
        createdDivIds.push(eventCreator.id)

        document.getElementById(tagsId.eventTitle).value = document.title
        document.getElementById(tagsId.startDate).value = startDateTime.dateISO.slice(0, 16)
        document.getElementById(tagsId.endDate).value = endDateTime.dateISO.slice(0, 16)

        document.getElementById(tagsId.submitEventCreation).addEventListener('click', () => submitEventCreation(tagsId))
    })
}

async function highlightEmailDates() {
    const res = await browser.runtime.sendMessage({
        action: 'tagDates',
        innerHTML: document.body.innerHTML,
        textContent: document.body.textContent,
    })
    document.body.innerHTML = res.modifiedMailInnerHTML
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

