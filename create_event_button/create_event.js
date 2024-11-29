const calendarItems = messenger.calendar.items

export function createEvent(calendarId, eventData) {
    calendarItems.create(calendarId, {
        format: "jcal",
        type: 'event',
        id: 'ervg65re4vre6v4er6b4re6b4er6',

        item: [
            'vevent',
            [
                ['dtstart', {}, 'date', '2024-11-29'],
                ['dtend', {}, 'date', '2024-11-30'],
                ['summary', {}, 'text', 'coucou'],
                ['status', {}, 'text', 'confirmed'],
                ['uid', {}, 'text', 'ervg65re4vre6v4er6b4re6b4er6'],
            ],
            []
        ]
    })
}