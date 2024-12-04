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
        result = findDates('', 'This 28 November')
        expect(result.length).to.equal(1)
    })
    it('should find exclude to old or too far dates', () => {
        let result
        result = findDates('', '01/24/2021')
        expect(result.length).to.equal(0)
        result = findDates('', '01/24/2064')
        expect(result.length).to.equal(0)
    })

    it('should find all dates in this email', () => {
        const emailContent = 'This is 24/01/2021. This 28 November. This number is alone 2024. 12\n11.' +
            "Let's meet the 19/12 at 12 PM or 1 AM"
        const result = findDates('', emailContent)


        expect(result).to.deep.equal([{
            "dateISO": "2021-01-24T19:00:00.000Z",
            "dateJs": new Date('2021-01-24T19:00:00.000Z'),
            "originalData": {
                "date": "2021-01-24",
                "originalText": "24/01/2021",
            }
        }, {
            "dateISO": "2024-11-28T19:00:00.000Z",
            "dateJs": new Date('2024-11-28T19:00:00.000Z'),
            "originalData": {
                "date": "2024-11-28",
                "originalText": "28 November",
            }
        }, {
            "dateISO": "2024-12-19T12:00:00.000Z",
            "dateJs": new Date('2024-12-19T12:00:00.000Z'),
            "originalData": {
                "originalText": "19/12",
                "date": "2024-12-19",
            }
        }])
    })
    it('should find only one dates in this email', () => {
        const emailSubject = 'This is 24/01/2021'
        const emailContent = 'This is again 24/01/2021 for duplication purpose'
        const result = findDates(emailSubject, emailContent)
        expect(result).to.deep.equal([{
            "dateISO": "2021-01-24T00:00:00.000Z",
            "dateJs": new Date('2021-01-24T00:00:00.000Z'),
            "originalData": {
                "date": "2021-01-24",
                "originalText": "24/01/2021"
            }

        }])
    })
});
