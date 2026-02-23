(() => {
  // content_scripts/highlight_dates/tag_dates.js
  function getElementByText(parentElement, text) {
    function searchText(element) {
      if (element.nodeType === Node.ELEMENT_NODE) {
        let currentResults = [];
        for (let child of element.childNodes) {
          const recursiveResults = searchText(child);
          if (recursiveResults) {
            currentResults = currentResults.concat(recursiveResults);
          }
        }
        return currentResults;
      }
      if (element.nodeType === Node.TEXT_NODE || element.nodeType === Node.ELEMENT_NODE) {
        const textIndex = element.textContent.toLowerCase().indexOf(text);
        if (textIndex !== -1) {
          return [element];
        }
      }
      return null;
    }
    return searchText(parentElement);
  }
  async function tagMailContentDates(document2) {
    const mailContentPlainText = document2.body.textContent;
    const foundDates = await browser.runtime.sendMessage({
      action: "findDates",
      mailSubject: "",
      mailContentPlainText,
      removeDuplicatesDates: false
    });
    let HTMLIndex = 0;
    let foundHtmlElements = [];
    foundDates.map((oneFoundDate) => {
      const originalDateText = oneFoundDate.originalDateTimeData.date.originalText;
      const allDateTextElements = getElementByText(document2.body, originalDateText.toLowerCase());
      allDateTextElements.map((dateTextElement) => {
        const containerIdValue = `plugin-date-index-${HTMLIndex}`;
        if (dateTextElement?.nodeType === Node.TEXT_NODE) {
          const originalText = dateTextElement.textContent;
          const textIndex = originalText.toLowerCase().indexOf(originalDateText.toLowerCase());
          const originalStartTimeText = oneFoundDate.originalDateTimeData?.startTime?.originalText;
          const originalEndTimeText = oneFoundDate.originalDateTimeData?.endTime?.originalText;
          const startTimeIndex = originalText.toLowerCase().indexOf(originalStartTimeText);
          const endTimeIndex = originalText.toLowerCase().indexOf(originalEndTimeText);
          const startIndex = Math.max(textIndex, startTimeIndex, endTimeIndex);
          let endIndex = textIndex + +originalDateText.length;
          if (startTimeIndex > -1) {
            endIndex = Math.max(endIndex, startTimeIndex + originalStartTimeText.length);
          }
          if (endTimeIndex > -1) {
            endIndex = Math.max(endIndex, endTimeIndex + originalEndTimeText.length);
          }
          const spanModifiedText = document2.createElement("span");
          const dateHighlightSpan = document2.createElement("span");
          dateHighlightSpan.setAttribute("id", containerIdValue);
          dateHighlightSpan.setAttribute("class", "pluginMailToEvent-highlightDate");
          dateHighlightSpan.textContent = originalText.slice(startIndex, endIndex);
          spanModifiedText.appendChild(document2.createTextNode(originalText.slice(0, startIndex)));
          spanModifiedText.appendChild(dateHighlightSpan);
          spanModifiedText.appendChild(document2.createTextNode(originalText.slice(endIndex)));
          dateTextElement.parentElement.replaceChild(spanModifiedText, dateTextElement);
          HTMLIndex += 1;
          foundHtmlElements.push({
            ...oneFoundDate,
            htmlContainerIdValue: containerIdValue
          });
        }
      });
    });
    return {
      foundHtmlElements
    };
  }

  // create_event_button/pop_up_button.css
  var pop_up_button_default = '.pluginMailToEvent-popup {\n    margin: 0;\n}\n\n.pluginMailToEvent-popup > .pluginMailToEvent-event-creator {\n    border: none;\n    box-shadow: none;\n    border-radius: 0;\n    width: 350px;\n}\n\n.pluginMailToEvent-highlightDate {\n    text-decoration: underline;\n    text-decoration-color: #0a84ff;\n    text-underline-offset: 2px;\n    cursor: pointer;\n}\n\n.pluginMailToEvent-event-creator {\n    --bg-primary: #ffffff;\n    --bg-input: #f9f9fb;\n    --text-primary: #15141a;\n    --text-secondary: #5b5b66;\n    --border-color: #cfcfd8;\n    --accent: #0a84ff;\n    --accent-hover: #0060df;\n    --success: #058b00;\n    --error: #d70022;\n\n    background: var(--bg-primary);\n    color: var(--text-primary);\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n    font-size: 13px;\n    line-height: 1.4;\n    padding: 12px;\n    box-sizing: border-box;\n    border: 1px solid var(--border-color);\n    border-radius: 8px;\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n    min-width: 300px;\n}\n\n@media (prefers-color-scheme: dark) {\n    .pluginMailToEvent-event-creator {\n        --bg-primary: #2b2a33;\n        --bg-input: #42414d;\n        --text-primary: #fbfbfe;\n        --text-secondary: #cfcfd8;\n        --border-color: #5b5b66;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);\n    }\n}\n\n#detected-language:not(:empty) {\n    display: inline-block;\n    float: right;\n    font-size: 10px;\n    text-transform: uppercase;\n    color: var(--text-secondary);\n    padding: 1px 6px;\n    margin-bottom: 4px;\n}\n\n.pluginMailToEvent-event-creator input[type="text"],\n.pluginMailToEvent-event-creator input[type="datetime-local"],\n.pluginMailToEvent-event-creator textarea,\n.pluginMailToEvent-event-creator select {\n    box-sizing: border-box;\n    width: 100%;\n    height: 28px;\n    padding: 4px 8px;\n    border: 1px solid var(--border-color);\n    border-radius: 4px;\n    background: var(--bg-input);\n    color: var(--text-primary);\n    font-family: inherit;\n    font-size: 13px;\n}\n\n.pluginMailToEvent-event-creator textarea {\n    height: auto;\n    resize: vertical;\n}\n\n.form-group {\n    margin-bottom: 8px;\n}\n\n.form-group label {\n    display: block;\n    margin-bottom: 2px;\n    font-size: 12px;\n    color: var(--text-secondary);\n}\n\n#dates-selector {\n    max-height: 200px;\n    overflow-y: auto;\n}\n\n.pluginMailToEvent-calendarSection {\n    margin-top: 5px;\n    margin-bottom: 8px;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n\n.pluginMailToEvent-calendarSection select {\n    flex: 1;\n}\n\n.pluginMailToEvent-calendarSection label {\n    font-size: 12px;\n    color: var(--text-secondary);\n    white-space: nowrap;\n    display: flex;\n    align-items: center;\n    gap: 4px;\n}\n\n.pluginMailToEvent-timezoneSection {\n    margin-bottom: 8px;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n\n.pluginMailToEvent-timezoneSection select {\n    flex: 1;\n}\n\n.pluginMailToEvent-timezoneSection label {\n    font-size: 12px;\n    color: var(--text-secondary);\n    white-space: nowrap;\n    display: flex;\n    align-items: center;\n    gap: 4px;\n}\n\n\n.one-date-selector {\n    margin-bottom: 6px;\n    display: flex;\n    align-items: center;\n    gap: 6px;\n}\n\n.start-date-input {\n    flex: 1;\n}\n\n.submit-start-date {\n    width: auto;\n    height: 28px;\n    padding: 4px 10px;\n    border: none;\n    border-radius: 4px;\n    background: var(--accent);\n    color: #fff;\n    font-family: inherit;\n    font-size: 14px;\n    font-weight: 600;\n    cursor: pointer;\n}\n\n.one-date-selector .submit-start-date:hover {\n    border-color: var(--accent);\n}\n\n.one-date-selector  input[aria-selected="true"] {\n    border: 2px solid var(--accent);\n}\n\n.end-date-selector {\n    margin-bottom: 8px;\n}\n\n.end-date-selector label {\n    display: block;\n    margin-bottom: 2px;\n    font-size: 12px;\n    color: var(--text-secondary);\n}\n\n#create-calendar-event,\n.pluginMailToEvent-create-btn {\n    display: block;\n    width: 100%;\n    height: 32px;\n    margin-top: 8px;\n    padding: 0 16px;\n    border: none;\n    border-radius: 4px;\n    background: var(--accent);\n    color: #fff;\n    font-family: inherit;\n    font-size: 14px;\n    font-weight: 600;\n    cursor: pointer;\n}\n\n#create-calendar-event:hover:not(:disabled),\n.pluginMailToEvent-create-btn:hover:not(:disabled) {\n    background: var(--accent-hover);\n}\n\n#create-calendar-event:disabled,\n.pluginMailToEvent-create-btn:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n}\n\n#create-calendar-event.success,\n.pluginMailToEvent-create-btn.success {\n    background: var(--success);\n    opacity: 1;\n    cursor: default;\n}\n\n#create-calendar-event.error,\n.pluginMailToEvent-create-btn.error {\n    background: var(--error);\n    opacity: 1;\n}\n';

  // common/event_form.js
  function createEventFormTop(idPrefix = "") {
    const p = (id) => idPrefix ? `${idPrefix}-${id}` : id;
    const ids = {
      eventTitle: p("event-title"),
      calendarSelectorSection: p("calendar-selector-section"),
      calendarSelector: p("calendar-selector"),
      setDefaultCalendar: p("set-default-calendar"),
      timezoneSelectorSection: p("timezone-selector-section"),
      timezoneSelector: p("timezone-selector"),
      setDefaultTimezone: p("set-default-timezone")
    };
    const fragment = document.createDocumentFragment();
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.id = ids.eventTitle;
    titleInput.placeholder = "Event title";
    fragment.appendChild(titleInput);
    const calSection = document.createElement("div");
    calSection.id = ids.calendarSelectorSection;
    calSection.className = "pluginMailToEvent-calendarSection";
    const calSelect = document.createElement("select");
    calSelect.id = ids.calendarSelector;
    calSection.appendChild(calSelect);
    const calLabel = document.createElement("label");
    const calCheckbox = document.createElement("input");
    calCheckbox.type = "checkbox";
    calCheckbox.id = ids.setDefaultCalendar;
    calLabel.appendChild(calCheckbox);
    calLabel.appendChild(document.createTextNode(" Set as default"));
    calSection.appendChild(calLabel);
    fragment.appendChild(calSection);
    const tzSection = document.createElement("div");
    tzSection.id = ids.timezoneSelectorSection;
    tzSection.className = "pluginMailToEvent-timezoneSection";
    const tzSelect = document.createElement("select");
    tzSelect.id = ids.timezoneSelector;
    tzSection.appendChild(tzSelect);
    const tzLabel = document.createElement("label");
    const tzCheckbox = document.createElement("input");
    tzCheckbox.type = "checkbox";
    tzCheckbox.id = ids.setDefaultTimezone;
    tzLabel.appendChild(tzCheckbox);
    tzLabel.appendChild(document.createTextNode(" Set as default"));
    tzSection.appendChild(tzLabel);
    fragment.appendChild(tzSection);
    return { fragment, ids };
  }
  function createEventFormBottom(idPrefix = "") {
    const p = (id) => idPrefix ? `${idPrefix}-${id}` : id;
    const ids = {
      eventLocation: p("event-location"),
      eventComment: p("event-comment")
    };
    const fragment = document.createDocumentFragment();
    const locationGroup = document.createElement("div");
    locationGroup.className = "form-group";
    const locationLabel = document.createElement("label");
    locationLabel.htmlFor = ids.eventLocation;
    locationLabel.textContent = "Location";
    const locationInput = document.createElement("input");
    locationInput.type = "text";
    locationInput.id = ids.eventLocation;
    locationInput.placeholder = "Optional location";
    locationGroup.appendChild(locationLabel);
    locationGroup.appendChild(locationInput);
    fragment.appendChild(locationGroup);
    const commentGroup = document.createElement("div");
    commentGroup.className = "form-group";
    const commentLabel = document.createElement("label");
    commentLabel.htmlFor = ids.eventComment;
    commentLabel.textContent = "Description";
    const commentTextarea = document.createElement("textarea");
    commentTextarea.rows = 2;
    commentTextarea.id = ids.eventComment;
    commentTextarea.placeholder = "Optional description";
    commentGroup.appendChild(commentLabel);
    commentGroup.appendChild(commentTextarea);
    fragment.appendChild(commentGroup);
    return { fragment, ids };
  }

  // common/calendar_selector.js
  async function populateCalendarSelector(selectEl, defaultCheckboxEl, getCalendars) {
    const calendars = await getCalendars();
    calendars.forEach((cal) => {
      const option = document.createElement("option");
      option.value = cal.id;
      option.textContent = cal.name;
      selectEl.appendChild(option);
    });
    const { defaultCalendarId } = await browser.storage.local.get("defaultCalendarId");
    if (defaultCalendarId && calendars.some((c) => c.id === defaultCalendarId)) {
      selectEl.value = defaultCalendarId;
      defaultCheckboxEl.checked = true;
    }
    defaultCheckboxEl.addEventListener("change", async () => {
      if (defaultCheckboxEl.checked) {
        await browser.storage.local.set({ defaultCalendarId: selectEl.value });
      } else {
        await browser.storage.local.remove("defaultCalendarId");
      }
    });
    selectEl.addEventListener("change", async () => {
      if (defaultCheckboxEl.checked) {
        await browser.storage.local.set({ defaultCalendarId: selectEl.value });
      }
    });
  }

  // common/timezone_selector.js
  async function populateTimezoneSelector(selectEl, defaultCheckboxEl) {
    const timezoneIds = Intl.supportedValuesOf("timeZone");
    const currentZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    timezoneIds.forEach((tzId) => {
      const option = document.createElement("option");
      option.value = tzId;
      option.textContent = tzId;
      selectEl.appendChild(option);
    });
    const { defaultTimezone } = await browser.storage.local.get("defaultTimezone");
    if (defaultTimezone && timezoneIds.includes(defaultTimezone)) {
      selectEl.value = defaultTimezone;
      defaultCheckboxEl.checked = true;
    } else {
      selectEl.value = currentZone;
    }
    defaultCheckboxEl.addEventListener("change", async () => {
      if (defaultCheckboxEl.checked) {
        await browser.storage.local.set({ defaultTimezone: selectEl.value });
      } else {
        await browser.storage.local.remove("defaultTimezone");
      }
    });
    selectEl.addEventListener("change", async () => {
      if (defaultCheckboxEl.checked) {
        await browser.storage.local.set({ defaultTimezone: selectEl.value });
      }
    });
  }

  // content_scripts/highlight_dates/highlight_dates.js
  var style = document.createElement("style");
  style.textContent = pop_up_button_default;
  document.head.appendChild(style);
  var createdDivIds = [];
  function generateUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  async function eventCreatorPopup(oneFoundElement) {
    const { htmlContainerIdValue, startDateTime, endDateTime } = oneFoundElement;
    document.getElementById(htmlContainerIdValue).addEventListener("click", (clickEvent) => {
      const uid = generateUID();
      const eventCreator = document.createElement("div");
      eventCreator.id = `pluginMailToEvent-event-creator-${uid}`;
      eventCreator.className = `pluginMailToEvent-event-creator`;
      const { fragment: topFragment, ids: topIds } = createEventFormTop(uid);
      const { fragment: bottomFragment, ids: bottomIds } = createEventFormBottom(uid);
      const startDateContainer = document.createElement("div");
      startDateContainer.className = "form-group";
      const startDateLabel = document.createElement("label");
      startDateLabel.textContent = "Start date";
      const startDateInput = document.createElement("input");
      startDateInput.id = `${uid}-start-date`;
      startDateInput.type = "datetime-local";
      startDateInput.value = startDateTime.dateISO.slice(0, 16);
      startDateContainer.appendChild(startDateLabel);
      startDateContainer.appendChild(startDateInput);
      const endDateContainer = document.createElement("div");
      endDateContainer.className = "form-group";
      const endDateLabel = document.createElement("label");
      endDateLabel.textContent = "End date";
      const endDateInput = document.createElement("input");
      endDateInput.id = `${uid}-end-date`;
      endDateInput.type = "datetime-local";
      endDateInput.value = endDateTime.dateISO.slice(0, 16);
      endDateContainer.appendChild(endDateLabel);
      endDateContainer.appendChild(endDateInput);
      const submitButton = document.createElement("input");
      submitButton.type = "submit";
      submitButton.id = `${uid}-create-event`;
      submitButton.className = "pluginMailToEvent-create-btn";
      submitButton.value = "Create event";
      eventCreator.appendChild(topFragment);
      eventCreator.appendChild(startDateContainer);
      eventCreator.appendChild(endDateContainer);
      eventCreator.appendChild(bottomFragment);
      eventCreator.appendChild(submitButton);
      const x = window.scrollX + clickEvent.clientX;
      const y = window.scrollY + clickEvent.clientY;
      eventCreator.style = `position: absolute; top: ${y}px; left: ${x}px`;
      document.body.appendChild(eventCreator);
      createdDivIds.push(eventCreator.id);
      document.getElementById(topIds.eventTitle).value = document.title;
      populateCalendarSelector(
        document.getElementById(topIds.calendarSelector),
        document.getElementById(topIds.setDefaultCalendar),
        () => browser.runtime.sendMessage({ action: "getCalendars" })
      );
      populateTimezoneSelector(
        document.getElementById(topIds.timezoneSelector),
        document.getElementById(topIds.setDefaultTimezone)
      );
      document.getElementById(`${uid}-create-event`).addEventListener("click", async () => {
        const selectedStartDate = document.getElementById(`${uid}-start-date`)?.value;
        const selectedEndDate = document.getElementById(`${uid}-end-date`)?.value;
        const title = document.getElementById(topIds.eventTitle).value;
        const comment = document.getElementById(bottomIds.eventComment).value || "";
        const location = document.getElementById(bottomIds.eventLocation).value || "";
        const calendarId = document.getElementById(topIds.calendarSelector)?.value;
        const timezone = document.getElementById(topIds.timezoneSelector)?.value;
        if (selectedStartDate && selectedEndDate && title) {
          submitButton.disabled = true;
          submitButton.value = "Creating\u2026";
          const result = await browser.runtime.sendMessage({
            action: "createCalendarEvent",
            calendarId,
            args: [selectedStartDate + ":00", selectedEndDate + ":00", title, comment, timezone, location]
          });
          if (result.error) {
            console.error(result);
            submitButton.value = "\u2717 " + (result.error?.message || "Error");
            submitButton.classList.add("error");
          } else {
            submitButton.value = "\u2713 Event created";
            submitButton.classList.add("success");
          }
        }
      });
    });
  }
  async function highlightEmailDates() {
    const res = await tagMailContentDates(document);
    res.foundHtmlElements.map(eventCreatorPopup);
  }
  highlightEmailDates();
  document.addEventListener("click", function(clickEvent) {
    const clickedOnAnEventCreator = clickEvent.target.closest(".pluginMailToEvent-event-creator") || clickEvent.target.closest(".pluginMailToEvent-highlightDate");
    if (!clickedOnAnEventCreator) {
      while (createdDivIds.length > 0) {
        const oneEventCreatorId = createdDivIds.pop();
        document.getElementById(oneEventCreatorId).remove();
      }
    }
  });
})();
