const calendarItems = messenger.calendar.items

function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function createEvent(calendarId, eventStartDate, eventEndDate, eventSummary, eventComment, timezone, location) {
    const uid = generateUID()
    const tzParam = timezone ? {tzid: timezone} : {}
    const properties = [
        ['dtstart', tzParam, 'date-time', eventStartDate],
        ['dtend', tzParam, 'date-time', eventEndDate],
        ['summary', {}, 'text', eventSummary],
        ['description', {}, 'text', eventComment],
        ['uid', {}, 'text', uid],
    ]
    if (location) {
        properties.push(['location', {}, 'text', location])
    }
    try {
        await calendarItems.create(calendarId, {
            format: "jcal",
            type: 'event',
            id: uid,

            item: [
                'vevent',
                properties,
                []
            ]
        })
    } catch (e) {
        return {error: e}
    }
    return {uid}
}