import {tagMailContentDates} from "./tag_dates.js";

browser.runtime.onMessage.addListener(async (message) => {
    const action = message?.action
    if (action === 'tagDates') {
        return tagMailContentDates(message.innerHTML, message.textContent)
    } else {
        throw `unknown action ${action}`
    }
})
