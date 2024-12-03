import "./pop_up_interaction.js";
import {getCurrentMailDates} from "../common/mail_to_date.js";


const showFoundDates = (dates) => {
    const datesContainer = document.getElementById('dates-selector');

    dates.map((oneFoundDate) => {
        let container = document.createElement("div",)
        container.className = "one-date-selector"

        const dateInput = document.createElement('input');

        dateInput.className = "start-date-input"
        dateInput.type = 'datetime-local';
        dateInput.value = oneFoundDate.dateISO.slice(0, 16)

        let selectOneDateInput = document.createElement('input');
        selectOneDateInput.type = "submit"
        selectOneDateInput.value = "select"
        selectOneDateInput.className = "submit-start-date"

        container.append(dateInput)
        container.append(selectOneDateInput)

        datesContainer.appendChild(container);
    })
}

const {dates, subject} = await getCurrentMailDates()
document.getElementById("event-title").value = subject
if (dates) {
    showFoundDates(dates)
}