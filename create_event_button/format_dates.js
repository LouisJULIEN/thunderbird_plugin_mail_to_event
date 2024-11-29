const isDigit = (aString) => /^[0-9]+$/.test(aString)

const formatYear = (year) => {
    return year || new Date().getFullYear();
};
const formatDay = (day) => day
const formatMonth = (month) => {
    if (isDigit(month)) {
        return month
    }
    console.log(month)
    const threeFirstLetters = month.slice(0, 3).toLowerCase()
    const monthToNumber = {
        'jan': 1,
        'fev': 2,
        'mar': 3,
        'avr': 4,
        'mai': 5,
        'jun': 6,
        'jui': 7,
        'aug': 8,
        'sep': 9,
        'oct': 10,
        'nov': 11,
        'dec': 12,
    }
    return monthToNumber[threeFirstLetters] || null
}
const formatHourMinutes = (hours, minutes, ampm) => {
    if (ampm === 'pm') {
        hours += 12
    }
    return {hours, minutes}
}

export const formatFoundDate = (aFoundDate) => {
    return {
        year: formatYear(aFoundDate.year),
        month: formatMonth(aFoundDate.month),
        day: formatDay(aFoundDate.day),
        ...formatHourMinutes(aFoundDate.hours, aFoundDate.minutes, aFoundDate.ampm)
    }

}