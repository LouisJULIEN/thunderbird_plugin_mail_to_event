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
    return null;
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
    const [year, month, day] = aFoundDate.date.split('-')
    const dateData = {
        year: formatYear(year),
        month: formatMonth(month),
        day: formatDay(day),
    }
    const dateJs = new Date(
        dateData.year,
        (dateData.month || 1) - 1, // monthIndex starts at 0 e.g. January is 0
        dateData.day,)

    dateJs.setTime(dateJs.getTime() - dateJs.getTimezoneOffset() * 60 * 1000);

    const dateISO = dateJs.toISOString()
    return {
        originalData: aFoundDate,
        dateJs,
        dateISO
    }

}