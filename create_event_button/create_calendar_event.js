const calendarItems = messenger.calendar.items

function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function createEvent(calendarId, eventStartDate, eventEndDate, eventSummary, eventComment) {
    const uid = generateUID()
    try {
        await calendarItems.create(calendarId, {
            format: "jcal",
            type: 'event',
            id: uid,

            item: [
                'vevent',
                [
                    ['dtstart', {}, 'date-time', eventStartDate],
                    ['dtend', {}, 'date-time', eventEndDate],
                    ['summary', {}, 'text', eventSummary],
                    ['description', {}, 'text', eventComment],
                    ['uid', {}, 'text', uid],
                ],
                []
            ]
        })
    } catch (e) {
        return {error: e}
    }
    return {uid}
}