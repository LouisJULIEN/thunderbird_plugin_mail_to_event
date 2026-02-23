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
  var pop_up_button_default = `.pluginMailToEvent-popup {
    margin: 0;
}

.pluginMailToEvent-popup > .pluginMailToEvent-event-creator {
    border: none;
    box-shadow: none;
    border-radius: 0;
    width: 350px;
}

.pluginMailToEvent-drag-handle {
    height: 16px;
    margin: -12px -12px 8px;
    border-radius: 8px 8px 0 0;
    background: var(--border-color);
    cursor: grab;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
}

.pluginMailToEvent-drag-handle::before,
.pluginMailToEvent-drag-handle::after {
    content: '';
    width: 24px;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 1px;
}

.pluginMailToEvent-drag-handle:active {
    cursor: grabbing;
}

.pluginMailToEvent-event-creator--dragging {
    opacity: 0.8 !important;
}

.pluginMailToEvent-highlightDate {
    text-decoration: underline;
    text-decoration-color: #0a84ff;
    text-underline-offset: 2px;
    cursor: pointer;
}

.pluginMailToEvent-event-creator {
    --bg-primary: #ffffff;
    --bg-input: #f9f9fb;
    --text-primary: #15141a;
    --text-secondary: #5b5b66;
    --border-color: #cfcfd8;
    --accent: #0a84ff;
    --accent-hover: #0060df;
    --success: #058b00;
    --error: #d70022;

    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 300px;
}

@media (prefers-color-scheme: dark) {
    .pluginMailToEvent-event-creator {
        --bg-primary: #2b2a33;
        --bg-input: #42414d;
        --text-primary: #fbfbfe;
        --text-secondary: #cfcfd8;
        --border-color: #5b5b66;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
}

#detected-language:not(:empty) {
    display: inline-block;
    float: right;
    font-size: 10px;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding: 1px 6px;
    margin-bottom: 4px;
}

.pluginMailToEvent-event-creator input[type="text"],
.pluginMailToEvent-event-creator input[type="datetime-local"],
.pluginMailToEvent-event-creator textarea,
.pluginMailToEvent-event-creator select {
    box-sizing: border-box;
    width: 100%;
    height: 28px;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 13px;
}

.pluginMailToEvent-event-creator textarea {
    height: auto;
    resize: vertical;
}

.form-group {
    margin-bottom: 8px;
}

.form-group label {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    color: var(--text-secondary);
}

#dates-selector {
    max-height: 200px;
    overflow-y: auto;
}

.pluginMailToEvent-calendarSection {
    margin-top: 5px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pluginMailToEvent-calendarSection select {
    flex: 1;
}

.pluginMailToEvent-calendarSection label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
}

.pluginMailToEvent-timezoneSection {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pluginMailToEvent-timezoneSection select {
    flex: 1;
}

.pluginMailToEvent-timezoneSection label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
}


.one-date-selector {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.start-date-input {
    flex: 1;
}

.submit-start-date {
    width: auto;
    height: 28px;
    padding: 4px 10px;
    border: none;
    border-radius: 4px;
    background: var(--accent);
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.one-date-selector .submit-start-date:hover {
    border-color: var(--accent);
}

.one-date-selector  input[aria-selected="true"] {
    border: 2px solid var(--accent);
}

.end-date-selector {
    margin-bottom: 8px;
}

.end-date-selector label {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    color: var(--text-secondary);
}

#create-calendar-event,
.pluginMailToEvent-create-btn {
    display: block;
    width: 100%;
    height: 32px;
    margin-top: 8px;
    padding: 0 16px;
    border: none;
    border-radius: 4px;
    background: var(--accent);
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

#create-calendar-event:hover:not(:disabled),
.pluginMailToEvent-create-btn:hover:not(:disabled) {
    background: var(--accent-hover);
}

#create-calendar-event:disabled,
.pluginMailToEvent-create-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#create-calendar-event.success,
.pluginMailToEvent-create-btn.success {
    background: var(--success);
    opacity: 1;
    cursor: default;
}

#create-calendar-event.error,
.pluginMailToEvent-create-btn.error {
    background: var(--error);
    opacity: 1;
}
`;

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
  var activePopups = /* @__PURE__ */ new Map();
  var savedValues = /* @__PURE__ */ new Map();
  function generateUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function makeDraggable(el) {
    let isDragging = false, startX, startY, startLeft, startTop;
    const handle = el.querySelector(".pluginMailToEvent-drag-handle");
    handle.addEventListener("mousedown", (e) => {
      isDragging = true;
      el.classList.add("pluginMailToEvent-event-creator--dragging");
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(el.style.left) || 0;
      startTop = parseInt(el.style.top) || 0;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      el.style.left = startLeft + e.clientX - startX + "px";
      el.style.top = startTop + e.clientY - startY + "px";
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
      el.classList.remove("pluginMailToEvent-event-creator--dragging");
    });
  }
  async function eventCreatorPopup(oneFoundElement) {
    const { htmlContainerIdValue, startDateTime, endDateTime } = oneFoundElement;
    document.getElementById(htmlContainerIdValue).addEventListener("click", (clickEvent) => {
      if (activePopups.has(htmlContainerIdValue)) return;
      const uid = generateUID();
      const eventCreator = document.createElement("div");
      eventCreator.id = `pluginMailToEvent-event-creator-${uid}`;
      eventCreator.className = "pluginMailToEvent-event-creator";
      const dragHandle = document.createElement("div");
      dragHandle.className = "pluginMailToEvent-drag-handle";
      eventCreator.appendChild(dragHandle);
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
      activePopups.set(htmlContainerIdValue, eventCreator);
      const saved = savedValues.get(htmlContainerIdValue);
      if (saved) {
        document.getElementById(topIds.eventTitle).value = saved.title ?? document.title;
        document.getElementById(`${uid}-start-date`).value = saved.startDate ?? startDateInput.value;
        document.getElementById(`${uid}-end-date`).value = saved.endDate ?? endDateInput.value;
        if (saved.location) document.getElementById(bottomIds.eventLocation).value = saved.location;
        if (saved.comment) document.getElementById(bottomIds.eventComment).value = saved.comment;
      } else {
        document.getElementById(topIds.eventTitle).value = document.title;
      }
      eventCreator.addEventListener("input", () => {
        savedValues.set(htmlContainerIdValue, {
          title: document.getElementById(topIds.eventTitle)?.value,
          startDate: document.getElementById(`${uid}-start-date`)?.value,
          endDate: document.getElementById(`${uid}-end-date`)?.value,
          location: document.getElementById(bottomIds.eventLocation)?.value,
          comment: document.getElementById(bottomIds.eventComment)?.value
        });
      });
      makeDraggable(eventCreator);
      populateCalendarSelector(
        document.getElementById(topIds.calendarSelector),
        document.getElementById(topIds.setDefaultCalendar),
        () => browser.runtime.sendMessage({ action: "getCalendars" })
      );
      populateTimezoneSelector(
        document.getElementById(topIds.timezoneSelector),
        document.getElementById(topIds.setDefaultTimezone)
      );
      submitButton.addEventListener("click", async () => {
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
            submitButton.disabled = false;
            submitButton.value = "\u2717 " + (result.error?.message || "Error");
            submitButton.classList.add("error");
          } else {
            submitButton.value = "\u2713 Event created";
            submitButton.classList.add("success");
            savedValues.delete(htmlContainerIdValue);
          }
        }
      });
      eventCreator.addEventListener("mouseleave", () => {
        eventCreator.classList.add("pluginMailToEvent-event-creator--visited");
      }, { once: true });
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
      activePopups.forEach((popup, key) => {
        popup.remove();
        activePopups.delete(key);
      });
    }
  });
})();
