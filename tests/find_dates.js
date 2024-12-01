import {expect} from "chai";
import {ddmonthPattern, findDates, splitTextIntoSentences} from "../common/find_dates.js";
import { set, reset } from 'mockdate'

describe('find dates', function () {

    before(()=>{
        set('2024-12-19T18:09:00.000Z')
    })
    after(()=>{
        reset('2024-12-19T18:09:00.000Z')
    })

    it('should split into sentences', () => {

        const textWithSentences = `This is a sentence. This is another sentence! Is this a question?
This sentence ends with a line return
This is a new sentence on a new line.A last one`;

        const sentences = splitTextIntoSentences(textWithSentences)
        expect(sentences.length).to.equal(6);
    });

    it('should find natural language dates', () => {
        let result;
        result = ddmonthPattern.test('12 janu 2024')
        expect(result).to.be.true
        result = ddmonthPattern.test('12 janvier 2024')
        expect(result).to.be.false
        result = ddmonthPattern.test('oeoeoe 12 coucou jan salut')
        expect(result).to.be.true
    })

    it('should find all dates in this email', () => {
        const emailContent = 'This is 01/24/2021. This 28 November. This number is alone 2024. 12\n11.' +
            "Let's meet the 19/12 at 12 PM or 1 AM"
        const result = findDates('', emailContent)


        expect(result).to.deep.equal([{
            "dateISO": "2021-01-24T19:00:00.000Z",
            "dateJs": new Date('2021-01-24T19:00:00.000Z'),
            "originalData": {
                "day": "24",
                "month": "01",
                "originalText": "01/24/2021",
                "patternIndex": 1,
                "regexIndex": 8,
                "textSourceIndex": 1,
                "year": "2021",
            }
        }, {
            "dateISO": "2024-11-28T19:00:00.000Z",
            "dateJs": new Date('2024-11-28T19:00:00.000Z'),
            "originalData": {
                "day": "28",
                "month": "Nove",
                "originalText": "28 November.",
                "patternIndex": 3,
                "regexIndex": 24,
                "textSourceIndex": 1,
                "year": undefined,
            }
        }, {
            "dateISO": "2024-12-19T12:00:00.000Z",
            "dateJs": new Date('2024-12-19T12:00:00.000Z'),
            "originalData": {
                "ampm": "PM",
                "day": "19",
                "hours": "12",
                "month": "12",
                "originalText": "19/12",
                "patternIndex": 5,
                "regexIndex": 83,
                "textSourceIndex": 1,
            }
        }])
    })
    it('should find only one dates in this email', () => {
        const emailSubject = 'This is 01/24/2021'
        const emailContent = 'This is again 01/24/2021 for duplication purpose'
        const result = findDates(emailSubject, emailContent)
        expect(result).to.deep.equal([{
            "dateISO": "2021-01-24T19:00:00.000Z",
            "dateJs": new Date('2021-01-24T19:00:00.000Z'),
            "originalData": {
                "day": "24",
                "month": "01",
                "originalText": "01/24/2021",
                "patternIndex": 1,
                "regexIndex": 8,
                "textSourceIndex": 0,
                "year": "2021",
            }
        },])
    })
});
