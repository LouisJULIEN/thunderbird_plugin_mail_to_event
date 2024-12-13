import {expect} from "chai";
import {findDates, splitTextIntoSentences} from "../common/find_dates.js";
import {set, reset} from 'mockdate'

describe('find dates', function () {

    before(() => {
        set('2024-12-19T18:09:00.000Z')
    })
    after(() => {
        reset('2024-12-19T18:09:00.000Z')
    })

    it('should split into sentences', () => {

        const textWithSentences = `This is a sentence. This is another sentence! Is this a question?
This sentence ends with a line return
This is a new sentence on a new line.A last one`;

        const sentences = splitTextIntoSentences(textWithSentences)
        expect(sentences.length).to.equal(6);
    });

    it('should find simple dates', () => {
        let result

        result = findDates('', '24-01-2024')
        expect(result.length).to.equal(1)
        result = findDates('', '24/01/2024')
        expect(result.length).to.equal(1)
        result = findDates('', '24/01/2024.')
        expect(result.length).to.equal(1)

        result = findDates('', '19/12')
        expect(result.length).to.equal(1)
        result = findDates('', 'This 28 November.')
        expect(result.length).to.equal(1)
    })

    it('should find french dates', () => {
        let result

        result = findDates('', 'Ce 28 Juillet je vais à la mer avec ma mère')
        expect(result.length).to.equal(1)
        result = findDates('', 'Ce 28 juillet je vais à la mer avec ma mère')
        expect(result.length).to.equal(1)
        result = findDates('', 'Ce 28 Décembre je vais à la montagne avec ma mère')
        expect(result.length).to.equal(1)
        result = findDates('', 'Je vous donne rendez-vous le 18 Décembre à H7 au 70 quai Perrache, 69002, Lyon.')
        expect(result.length).to.equal(1)
        result = findDates('', 'Je vous donne rendez-vous le 18 Décembre, à H7 au 70 quai Perrache, 69002, Lyon.')
        expect(result.length).to.equal(1)
    })

    it('should find exclude to old or too far dates', () => {
        let result
        result = findDates('', '01/24/2021')
        expect(result.length).to.equal(0)
        result = findDates('', '01/24/2064')
        expect(result.length).to.equal(0)
    })

    it('should find datetimes in english text', () => {
        let result
        result = findDates('', '12 september from 9AM for lunch')
        expect(result[0].startDateTime.dateISO).to.equal("2024-09-12T09:00:00.000Z")
        expect(result[0].endDateTime.dateISO).to.equal("2024-09-12T09:30:00.000Z")

        result = findDates('', '12 september from 10 AM for lunch')
        expect(result[0].startDateTime.dateISO).to.equal("2024-09-12T10:00:00.000Z")
        expect(result[0].endDateTime.dateISO).to.equal("2024-09-12T10:30:00.000Z")

        result = findDates('', '12 september from 9 AM to 10 AM for lunch')
        expect(result[0].startDateTime.dateISO).to.equal("2024-09-12T09:00:00.000Z")
        expect(result[0].endDateTime.dateISO).to.equal("2024-09-12T10:00:00.000Z")

        result = findDates('', '12 september from 11 AM to 1 PM for lunch')
        expect(result[0].startDateTime.dateISO).to.equal("2024-09-12T11:00:00.000Z")
        expect(result[0].endDateTime.dateISO).to.equal("2024-09-12T13:00:00.000Z")

        result = findDates('', '12 september at 1 PM or 11 AM for lunch')
        expect(result[0].startDateTime.dateISO).to.equal("2024-09-12T13:00:00.000Z")
        expect(result[0].endDateTime.dateISO).to.equal("2024-09-12T13:30:00.000Z")
    })

    it('should find all dates in this email', () => {
        const emailContent = 'This is 24/01/2021. This 28 November. This number is alone 2024. 12\n11.' +
            "Let's meet the 19/12 at 11 PM"
        const result = findDates('', emailContent)


        expect(result).to.deep.equal([{
            "endDateTime": {
                "dateISO": "2021-01-24T19:30:00.000Z",
                "dateJs": new Date('2021-01-24T19:30:00.000Z')
            },
            "originalDateTimeData": {
                "date": {
                    "date": "2021-01-24",
                    "originalText": "24/01/2021"
                }
            },
            "startDateTime": {
                "dateISO": "2021-01-24T19:00:00.000Z",
                "dateJs": new Date('2021-01-24T19:00:00.000Z')
            }
        }, {
            "endDateTime": {
                "dateISO": "2024-11-28T19:30:00.000Z",
                "dateJs": new Date('2024-11-28T19:30:00.000Z')
            },
            "originalDateTimeData": {
                "date": {
                    "date": "2024-11-28",
                    "originalText": "28 November"
                }
            },
            "startDateTime": {
                "dateISO": "2024-11-28T19:00:00.000Z",
                "dateJs": new Date('2024-11-28T19:00:00.000Z')
            }
        }, {
            "endDateTime": {
                "dateISO": "2024-12-19T23:30:00.000Z",
                "dateJs": new Date('2024-12-19T23:30:00.000Z')
            },
            "originalDateTimeData": {
                "date": {
                    "date": "2024-12-19",
                    "originalText": "19/12"
                },
                "startTime": {
                    "originalText": "11 PM",
                    "time": "23:00"
                }
            },
            "startDateTime": {
                "dateISO": "2024-12-19T23:00:00.000Z",
                "dateJs": new Date('2024-12-19T23:00:00.000Z')
            }
        }])
    })

    it('should find only one dates in this email', () => {
        const emailSubject = 'This is 24/01/2021'
        const emailContent = 'This is again 24/01/2021 for duplication purpose'
        const result = findDates(emailSubject, emailContent)
        expect(result).to.deep.equal([{
            "endDateTime": {
                "dateISO": "2021-01-24T19:30:00.000Z",
                "dateJs": new Date('2021-01-24T19:30:00.000Z'),
            },
            "originalDateTimeData": {
                "date": {
                    "date": "2021-01-24",
                    "originalText": "24/01/2021"
                }
            },
            "startDateTime": {
                "dateISO": "2021-01-24T19:00:00.000Z",
                "dateJs": new Date('2021-01-24T19:00:00.000Z'),
            }
        }])
    })
});
