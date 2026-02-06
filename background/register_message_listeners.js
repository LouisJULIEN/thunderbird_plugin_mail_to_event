import {createEvent} from "../create_event_button/create_calendar_event.js";
import {findDates} from "../common/find_dates.js";

browser.runtime.onMessage.addListener(async (message) => {
    const action = message?.action
    if (action === 'findDates') {
        return findDates(message.mailSubject, message.mailContentPlainText, message.removeDuplicatesDates)
    }
    else if (action === 'getCalendars') {
        return messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
    }
    else if (action === 'createCalendarEvent') {
        let calendarId = message.calendarId
        if (!calendarId) {
            const {defaultCalendarId} = await browser.storage.local.get("defaultCalendarId")
            calendarId = defaultCalendarId
        }
        if (!calendarId) {
            const calendars = await messenger.calendar.calendars.query({visible: true, readOnly: false, enabled: true})
            calendarId = calendars[0].id
        }
        return createEvent(calendarId, ...message.args)
    }
    else{
        throw `Unknown message ${message}`
    }
})
