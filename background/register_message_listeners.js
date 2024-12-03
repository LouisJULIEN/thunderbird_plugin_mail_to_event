import {tagMailContentDates} from "./tag_dates.js";
import {createEvent} from "../create_event_button/create_calendar_event.js";

browser.runtime.onMessage.addListener(async (message) => {
    const action = message?.action
    if (action === 'tagDates') {
        return tagMailContentDates(message.innerHTML, message.textContent)
    }
    else if (action === 'createCalendarEvent') {
        const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
        const currentCalendar = calendars[0]
        return createEvent(currentCalendar.id, ...message.args)
    }
    else{
        throw `Unknown message ${message}`
    }
})
