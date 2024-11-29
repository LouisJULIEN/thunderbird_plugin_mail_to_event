import {findDates} from "./find_dates.js";

let tabs = await messenger.tabs.query({active: true, currentWindow: true});
let message = await messenger.messageDisplay.getDisplayedMessage(tabs[0].id);

const subject = message.subject;
const fullMessage = await messenger.messages.getFull(message.id);

const dates = findDates(subject, "The meeting is scheduled for 12/25/2023. Another important date is 2024-01-15. Don't forget the anniversary on 05-12-2024 and the event on 2023/08/10.");
document.getElementById("dates").textContent = dates.join('<br/>')

