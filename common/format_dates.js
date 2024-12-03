const isDigit = (aString) => /^[0-9]+$/.test(aString)

const formatYear = (year) => {
    if (isDigit(year)) {
        return +year
    }
    return (new Date()).getFullYear();

}
const formatDay = (day) => {
    if (isDigit(day)) {
        return +day
    }
    return null
}
const formatMonth = (month) => {
    if (isDigit(month)) {
        return +month
    }
    const threeFirstLetters = month.slice(0, 3).toLowerCase()
    const monthToNumber = {
        'jan': 1,
        'feb': 2,
        'mar': 3,
        'apr': 4,
        'may': 5,
        'jun': 6,
        'jul': 7,
        'aug': 8,
        'sep': 9,
        'oct': 10,
        'nov': 11,
        'dec': 12,
    }
    return monthToNumber[threeFirstLetters] || null
}
const formatHourMinutes = (hours, minutes, ampm) => {
    if (hours && ampm === 'pm') {
        hours += 12
    }

    const now = new Date()
    hours = hours || now.getHours()
    minutes = minutes || (now.getMinutes() - (now.getMinutes() % 30))

    return {hours, minutes}
}

export const formatFoundDate = (aFoundDate) => {
    const dateData = {
        year: formatYear(aFoundDate.year),
        month: formatMonth(aFoundDate.month),
        day: formatDay(aFoundDate.day),
        ...formatHourMinutes(aFoundDate.hours, aFoundDate.minutes, aFoundDate.ampm)
    }
    const dateJs = new Date(
        dateData.year,
        (dateData.month || 1) - 1, // monthIndex starts at 0 e.g. January is 0
        dateData.day,
        dateData.hours,
        dateData.minutes)

    dateJs.setTime(dateJs.getTime() - dateJs.getTimezoneOffset() * 60 * 1000);

    const dateISO = dateJs.toISOString()
    return {
        originalData: aFoundDate,
        dateJs,
        dateISO
    }

}