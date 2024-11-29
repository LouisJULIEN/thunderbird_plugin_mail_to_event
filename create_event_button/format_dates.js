const isDigit = (aString) => /^[0-9]+$/.test(aString)

const formatYear = (year) => {
    return year || new Date().getFullYear();
};
const formatDay = (day) => {
    return ("0" + `${day}`).slice(-2)
}
const formatMonth = (month) => {
    if (isDigit(month)) {
        return ("0" + `${month}`).slice(-2)
    }
    const threeFirstLetters = month.slice(0, 3).toLowerCase()
    const monthToNumber = {
        'jan': "01",
        'feb': "02",
        'mar': "03",
        'apr': "04",
        'may': "05",
        'jun': "06",
        'jui': "07",
        'aug': "08",
        'sep': "09",
        'oct': "10",
        'nov': "11",
        'dec': "12",
    }
    return monthToNumber[threeFirstLetters] || null
}
const formatHourMinutes = (hours, minutes, ampm) => {
    if(hours) {
        if (ampm === 'pm') {
            hours += 12
        }
        minutes = minutes || 0
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