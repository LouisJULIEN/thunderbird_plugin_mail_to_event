import {expect} from "chai";
import {JSDOM} from 'jsdom'
import {set, reset} from 'mockdate'
import {tagMailContentDates} from "../background/tag_dates.js";

describe('highlight dates', function () {

    before(() => {
        set('2024-12-19T18:09:00.000Z')
    })
    after(() => {
        reset('2024-12-19T18:09:00.000Z')
    })

    it('should find tag found dates', async () => {
        const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email with Dates</title>
</head>
<body>
    <div class="container">
        <h1>Upcoming Events</h1>
        <p>Dear [Recipient's Name],</p>
        <p>We are excited to announce the following upcoming events:</p>

        <h2>Event 1: Annual Conference</h2>
        <p>Date: <span class="date">December 5, 2024</span> <span class="date">10:00 AM - 5:00 PM</span></p>
        <p>Location: Conference Hall, Main Building</p>

        <h2>Event 2: Team Building Workshop</h2>
        <p>Date: <span class="date">December 10, 2024</span> <span class="date">9:00 AM - 12:00 PM</span></p>
        <p>Location: Training Room, Second Floor</p>

        <h2>Event 3: Holiday Party</h2>
        <p>Date: <span class="date">December 15, 2024</span> <span class="date">6:00 PM - 9:00 PM</span></p>
        <p>Location: Banquet Hall, Downtown</p>

        <h2>Event 4: Year-End Review Meeting</h2>
        <p>Date: <span class="date">December 20</span> <span class="date">2:00 PM - 4:00 PM</span></p>
        <p>Location: Board Room, Executive Wing</p>

        <p>Please mark your calendars and join us for these exciting events!</p>

        <p>Best regards,</p>
        <p>[Your Name]<br>
        [Your Position]<br>
        [Your Contact Information]</p>
    </div>
</body>
</html>
`
        const emailContentDOM = new JSDOM(emailContent, 'text/html');
        const emailContentHtml = emailContentDOM.window.document.body.innerHTML
        const emailContentText = emailContentDOM.window.document.body.textContent
        const result = await tagMailContentDates(emailContentHtml, emailContentText)
        expect(result).to.deep.equal({
            "foundHtmlElements": [
                {
                    "endDateTime": {
                        "dateISO": "2024-12-05T17:00:00.000Z",
                        "dateJs": new Date('2024-12-05T17:00:00.000Z')
                    },
                    "htmlContainerIdValue": "plugin-date-index-0",
                    "originalDateTimeData": {
                        "date": {
                            "date": "2024-12-05",
                            "originalText": "December 5, 2024",
                        },
                        "endTime": {
                            "originalText": "5:00 PM",
                            "time": "17:00"
                        },
                        "startTime": {
                            "originalText": "10:00 AM",
                            "time": "10:00"
                        }
                    },
                    "startDateTime": {
                        "dateISO": "2024-12-05T10:00:00.000Z",
                        "dateJs": new Date('2024-12-05T10:00:00.000Z')
                    },
                },
                {
                    "endDateTime": {
                        "dateISO": "2024-12-10T12:00:00.000Z",
                        "dateJs": new Date('2024-12-10T12:00:00.000Z')
                    },
                    "htmlContainerIdValue": "plugin-date-index-1",
                    "originalDateTimeData": {
                        "date": {
                            "date": "2024-12-10",
                            "originalText": "December 10, 2024",
                        },
                        "endTime": {
                            "originalText": "12:00 PM",
                            "time": "12:00"
                        },
                        "startTime": {
                            "originalText": "9:00 AM",
                            "time": "09:00"
                        }
                    },
                    "startDateTime": {
                        "dateISO": "2024-12-10T09:00:00.000Z",
                        "dateJs": new Date('2024-12-10T09:00:00.000Z')
                    },
                },
                {
                    "endDateTime": {
                        "dateISO": "2024-12-15T21:00:00.000Z",
                        "dateJs": new Date('2024-12-15T21:00:00.000Z')
                    },
                    "htmlContainerIdValue": "plugin-date-index-2",
                    "originalDateTimeData": {
                        "date": {
                            "date": "2024-12-15",
                            "originalText": "December 15, 2024",
                        },
                        "endTime": {
                            "originalText": "9:00 PM",
                            "time": "21:00"
                        },
                        "startTime": {
                            "originalText": "6:00 PM",
                            "time": "18:00"
                        }
                    },
                    "startDateTime": {
                        "dateISO": "2024-12-15T18:00:00.000Z",
                        "dateJs": new Date('2024-12-15T18:00:00.000Z')
                    },
                },
                {
                    "endDateTime": {
                        "dateISO": "2024-12-20T16:00:00.000Z",
                        "dateJs": new Date('2024-12-20T16:00:00.000Z')
                    },
                    "htmlContainerIdValue": "plugin-date-index-3",
                    "originalDateTimeData": {
                        "date": {
                            "date": "2024-12-20",
                            "originalText": "December 20",
                        },
                        "endTime": {
                            "originalText": "4:00 PM",
                            "time": "16:00"
                        },
                        "startTime": {
                            "originalText": "2:00 PM",
                            "time": "14:00"
                        }
                    },
                    "startDateTime": {
                        "dateISO": "2024-12-20T14:00:00.000Z",
                        "dateJs": new Date('2024-12-20T14:00:00.000Z')
                    }
                }],
            modifiedMailInnerHTML: "\n    <div class=\"container\">\n        <h1>Upcoming Events</h1>\n        <p>Dear [Recipient's Name],</p>\n        <p>We are excited to announce the following upcoming events:</p>\n\n        <h2>Event 1: Annual Conference</h2>\n        <p>Date: <span class=\"date\"><span id=\"plugin-date-index-0\" class=\"pluginMailToEvent-highlightDate\">December 5, 2024</span></span> <span class=\"date\">10:00 AM - 5:00 PM</span></p>\n        <p>Location: Conference Hall, Main Building</p>\n\n        <h2>Event 2: Team Building Workshop</h2>\n        <p>Date: <span class=\"date\"><span id=\"plugin-date-index-1\" class=\"pluginMailToEvent-highlightDate\">December 10, 2024</span></span> <span class=\"date\">9:00 AM - 12:00 PM</span></p>\n        <p>Location: Training Room, Second Floor</p>\n\n        <h2>Event 3: Holiday Party</h2>\n        <p>Date: <span class=\"date\"><span id=\"plugin-date-index-2\" class=\"pluginMailToEvent-highlightDate\">December 15, 2024</span></span> <span class=\"date\">6:00 PM - 9:00 PM</span></p>\n        <p>Location: Banquet Hall, Downtown</p>\n\n        <h2>Event 4: Year-End Review Meeting</h2>\n        <p>Date: <span class=\"date\"><span id=\"plugin-date-index-3\" class=\"pluginMailToEvent-highlightDate\">December 20</span></span> <span class=\"date\">2:00 PM - 4:00 PM</span></p>\n        <p>Location: Board Room, Executive Wing</p>\n\n        <p>Please mark your calendars and join us for these exciting events!</p>\n\n        <p>Best regards,</p>\n        <p>[Your Name]<br>\n        [Your Position]<br>\n        [Your Contact Information]</p>\n    </div>\n\n\n"
        })
    })
})