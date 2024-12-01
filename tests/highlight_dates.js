import {expect} from "chai";
import {JSDOM} from 'jsdom'
import {set, reset} from 'mockdate'
import {tagMailContentDates} from "../background/tag_dates.js";

describe('find dates', function () {

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
        <p>Date: <span class="date">December 5, 2024</span></p>
        <p>Time: <span class="date">10:00 AM - 5:00 PM</span></p>
        <p>Location: Conference Hall, Main Building</p>

        <h2>Event 2: Team Building Workshop</h2>
        <p>Date: <span class="date">December 10, 2024</span></p>
        <p>Time: <span class="date">9:00 AM - 12:00 PM</span></p>
        <p>Location: Training Room, Second Floor</p>

        <h2>Event 3: Holiday Party</h2>
        <p>Date: <span class="date">December 15, 2024</span></p>
        <p>Time: <span class="date">6:00 PM - 9:00 PM</span></p>
        <p>Location: Banquet Hall, Downtown</p>

        <h2>Event 4: Year-End Review Meeting</h2>
        <p>Date: <span class="date">December 20, 2024</span></p>
        <p>Time: <span class="date">2:00 PM - 4:00 PM</span></p>
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
        const result = await tagMailContentDates(emailContentDOM.window.document.body)
        expect(result).to.deep.equal([{
            originalData: {
                patternIndex: 4,
                textSourceIndex: 1,
                originalText: 'December 10, 2024',
                regexIndex: 254,
                month: 'Dece',
                day: '10',
                year: undefined
            },
            dateJs: new Date('2024-12-10T19:00:00.000Z'),
            dateISO: '2024-12-10T19:00:00.000Z',
            htmlContainerIdValue: 'plugin-date-index-0'
        }, {
            originalData: {
                patternIndex: 4,
                textSourceIndex: 1,
                originalText: 'December 15, 2024',
                regexIndex: 364,
                month: 'Dece',
                day: '15',
                year: undefined
            },
            dateJs: new Date('2024-12-15T19:00:00.000Z'),
            dateISO: '2024-12-15T19:00:00.000Z',
            htmlContainerIdValue: 'plugin-date-index-1'
        }, {
            originalData: {
                patternIndex: 4,
                textSourceIndex: 1,
                originalText: 'December 20, 2024',
                regexIndex: 478,
                month: 'Dece',
                day: '20',
                year: undefined
            },
            dateJs: new Date('2024-12-20T19:00:00.000Z'),
            dateISO: '2024-12-20T19:00:00.000Z',
            htmlContainerIdValue: 'plugin-date-index-2'
        }])
    })
})