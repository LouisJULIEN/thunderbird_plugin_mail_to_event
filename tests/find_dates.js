import {expect} from "chai";
import {ddmonthPattern, findDates, splitTextIntoSentences} from "../create_event_button/find_dates.js";


describe('find dates', function () {
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
        const result = findDates(emailContent, '')
        expect(result).to.deep.equal([{
            patternIndex: 1,
            textSourceIndex: 0,
            originalText: '01/24/2021',
            regexIndex: 8,
            month: '01',
            day: '24',
            year: '2021'
        }, {
            patternIndex: 3,
            textSourceIndex: 0,
            originalText: '28 November.',
            regexIndex: 5,
            day: '28',
            month: 'Nove',
            year: undefined
        }, {
            ampm: "PM",
            day: "19",
            hours: "12",
            month: "12",
            originalText: "19/12",
            patternIndex: 5,
            regexIndex: 15,
            textSourceIndex: 0
        }])
    })
});