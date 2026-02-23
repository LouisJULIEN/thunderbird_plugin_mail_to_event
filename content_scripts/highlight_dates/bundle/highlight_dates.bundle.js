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
      startDateContainer.className = "one-date-selector";
      const startDateLabel = document.createElement("label");
      startDateLabel.textContent = "Start date";
      const startDateInput = document.createElement("input");
      startDateInput.id = `${uid}-start-date`;
      startDateInput.type = "datetime-local";
      startDateInput.value = startDateTime.dateISO.slice(0, 16);
      startDateContainer.appendChild(startDateLabel);
      startDateContainer.appendChild(document.createElement("br"));
      startDateContainer.appendChild(startDateInput);
      const endDateContainer = document.createElement("div");
      endDateContainer.className = "one-date-selector";
      const endDateLabel = document.createElement("label");
      endDateLabel.textContent = "End date";
      const endDateInput = document.createElement("input");
      endDateInput.id = `${uid}-end-date`;
      endDateInput.type = "datetime-local";
      endDateInput.value = endDateTime.dateISO.slice(0, 16);
      endDateContainer.appendChild(endDateLabel);
      endDateContainer.appendChild(document.createElement("br"));
      endDateContainer.appendChild(endDateInput);
      const resultDisplay = document.createElement("div");
      resultDisplay.id = `${uid}-result`;
      const submitButton = document.createElement("input");
      submitButton.type = "submit";
      submitButton.id = `${uid}-create-event`;
      submitButton.value = "Create event";
      eventCreator.appendChild(topFragment);
      eventCreator.appendChild(startDateContainer);
      eventCreator.appendChild(endDateContainer);
      eventCreator.appendChild(bottomFragment);
      eventCreator.appendChild(resultDisplay);
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
          const result = await browser.runtime.sendMessage({
            action: "createCalendarEvent",
            calendarId,
            args: [selectedStartDate + ":00", selectedEndDate + ":00", title, comment, timezone, location]
          });
          if (result.error) {
            document.getElementById(`${uid}-result`).innerText = result.error?.message;
            console.error(result);
          } else {
            document.getElementById(`${uid}-result`).innerText = "Event creation successful";
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
