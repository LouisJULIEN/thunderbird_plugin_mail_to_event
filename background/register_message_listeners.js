import {createEvent} from "../create_event_button/create_calendar_event.js";
import {findDates} from "../common/find_dates.js";

browser.runtime.onMessage.addListener(async (message) => {
    const action = message?.action
    if (action === 'findDates') {
        return findDates(message.mailSubject, message.mailContentPlainText, message.removeDuplicatesDates)
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
