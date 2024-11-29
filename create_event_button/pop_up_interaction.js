let differenceStartDateEndDate = 1000 * 60 * 30 // 30 minutes

const resetAriaSelected = () => {
    Array.from(document.getElementsByClassName('start-date-input')).forEach((e) => {
        e.ariaSelected = "false"
    })
}

document.getElementById("dates-selector").addEventListener('click',
    (clickedElement) => {
        if (clickedElement.target.className === "submit-start-date") {
            resetAriaSelected()

            const startDatePicker = clickedElement.target.parentElement.getElementsByClassName('start-date-input')?.[0];
            startDatePicker.ariaSelected = true

            const startDateValue = startDatePicker.value
            const endDateValue = new Date((new Date(startDateValue)).getTime() + differenceStartDateEndDate)
            const endDateValueFormated =`${endDateValue.getFullYear()}-${endDateValue.getMonth()}-${endDateValue.getDate()} ${endDateValue.getHours()}:${endDateValue.getMinutes()}`
            console.log(endDateValueFormated)
            document.getElementById('end-date-input').value = endDateValueFormated
        }
    })