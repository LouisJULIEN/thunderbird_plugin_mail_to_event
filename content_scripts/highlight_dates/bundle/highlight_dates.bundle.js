(()=>{function A(e,n){function o(r){if(r.nodeType===Node.ELEMENT_NODE){let i=[];for(let t of r.childNodes){let a=o(t);a&&(i=i.concat(a))}return i}return(r.nodeType===Node.TEXT_NODE||r.nodeType===Node.ELEMENT_NODE)&&r.textContent.toLowerCase().indexOf(n)!==-1?[r]:null}return o(e)}async function D(e){let n=e.body.textContent,o=await browser.runtime.sendMessage({action:"findDates",mailSubject:"",mailContentPlainText:n,removeDuplicatesDates:!1}),r=0,i=[];return o.map(t=>{let a=t.originalDateTimeData.date.originalText;A(e.body,a.toLowerCase()).map(s=>{let c=`plugin-date-index-${r}`;if(s?.nodeType===Node.TEXT_NODE){let u=s.textContent,p=u.toLowerCase().indexOf(a.toLowerCase()),g=t.originalDateTimeData?.startTime?.originalText,x=t.originalDateTimeData?.endTime?.originalText,v=u.toLowerCase().indexOf(g),f=u.toLowerCase().indexOf(x),E=Math.max(p,v,f),m=p+ +a.length;v>-1&&(m=Math.max(m,v+g.length)),f>-1&&(m=Math.max(m,f+x.length));let d=e.createElement("span"),b=e.createElement("span");b.setAttribute("id",c),b.setAttribute("class","pluginMailToEvent-highlightDate"),b.textContent=u.slice(E,m),d.appendChild(e.createTextNode(u.slice(0,E))),d.appendChild(b),d.appendChild(e.createTextNode(u.slice(m))),s.parentElement.replaceChild(d,s),r+=1,i.push({...t,htmlContainerIdValue:c})}})}),{foundHtmlElements:i}}var S=`.pluginMailToEvent-popup {
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
`;function z(e=""){let n=x=>e?`${e}-${x}`:x,o={eventTitle:n("event-title"),calendarSelectorSection:n("calendar-selector-section"),calendarSelector:n("calendar-selector"),setDefaultCalendar:n("set-default-calendar"),timezoneSelectorSection:n("timezone-selector-section"),timezoneSelector:n("timezone-selector"),setDefaultTimezone:n("set-default-timezone")},r=document.createDocumentFragment(),i=document.createElement("input");i.type="text",i.id=o.eventTitle,i.placeholder="Event title",r.appendChild(i);let t=document.createElement("div");t.id=o.calendarSelectorSection,t.className="pluginMailToEvent-calendarSection";let a=document.createElement("select");a.id=o.calendarSelector,t.appendChild(a);let l=document.createElement("label"),s=document.createElement("input");s.type="checkbox",s.id=o.setDefaultCalendar,l.appendChild(s),l.appendChild(document.createTextNode(" Set as default")),t.appendChild(l),r.appendChild(t);let c=document.createElement("div");c.id=o.timezoneSelectorSection,c.className="pluginMailToEvent-timezoneSection";let u=document.createElement("select");u.id=o.timezoneSelector,c.appendChild(u);let p=document.createElement("label"),g=document.createElement("input");return g.type="checkbox",g.id=o.setDefaultTimezone,p.appendChild(g),p.appendChild(document.createTextNode(" Set as default")),c.appendChild(p),r.appendChild(c),{fragment:r,ids:o}}function L(e=""){let n=s=>e?`${e}-${s}`:s,o={eventLocation:n("event-location"),eventComment:n("event-comment")},r=document.createDocumentFragment(),i=document.createElement("div");i.className="form-group";let t=document.createElement("input");t.type="text",t.id=o.eventLocation,t.placeholder="Optional location",i.appendChild(t),r.appendChild(i);let a=document.createElement("div");a.className="form-group";let l=document.createElement("textarea");return l.rows=2,l.id=o.eventComment,l.placeholder="Optional description",a.appendChild(l),r.appendChild(a),{fragment:r,ids:o}}async function B(e,n,o){let r=await o();r.forEach(t=>{let a=document.createElement("option");a.value=t.id,a.textContent=t.name,e.appendChild(a)});let{defaultCalendarId:i}=await browser.storage.local.get("defaultCalendarId");i&&r.some(t=>t.id===i)&&(e.value=i,n.checked=!0),n.addEventListener("change",async()=>{n.checked?await browser.storage.local.set({defaultCalendarId:e.value}):await browser.storage.local.remove("defaultCalendarId")}),e.addEventListener("change",async()=>{n.checked&&await browser.storage.local.set({defaultCalendarId:e.value})})}async function N(e,n){let o=Intl.supportedValuesOf("timeZone"),r=Intl.DateTimeFormat().resolvedOptions().timeZone;o.forEach(t=>{let a=document.createElement("option");a.value=t,a.textContent=t,e.appendChild(a)});let{defaultTimezone:i}=await browser.storage.local.get("defaultTimezone");i&&o.includes(i)?(e.value=i,n.checked=!0):e.value=r,n.addEventListener("change",async()=>{n.checked?await browser.storage.local.set({defaultTimezone:e.value}):await browser.storage.local.remove("defaultTimezone")}),e.addEventListener("change",async()=>{n.checked&&await browser.storage.local.set({defaultTimezone:e.value})})}var k=document.createElement("style");k.textContent=S;document.head.appendChild(k);var y=new Map,C=new Map;function Y(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){let n=Math.random()*16|0;return(e=="x"?n:n&3|8).toString(16)})}function _(e){let n=!1,o,r,i,t;e.querySelector(".pluginMailToEvent-drag-handle").addEventListener("mousedown",l=>{n=!0,e.classList.add("pluginMailToEvent-event-creator--dragging"),o=l.clientX,r=l.clientY,i=parseInt(e.style.left)||0,t=parseInt(e.style.top)||0,l.preventDefault()}),document.addEventListener("mousemove",l=>{n&&(e.style.left=i+l.clientX-o+"px",e.style.top=t+l.clientY-r+"px")}),document.addEventListener("mouseup",()=>{n=!1,e.classList.remove("pluginMailToEvent-event-creator--dragging")})}async function R(e){let{htmlContainerIdValue:n,startDateTime:o,endDateTime:r}=e;document.getElementById(n).addEventListener("click",i=>{if(y.has(n))return;let t=Y(),a=document.createElement("div");a.id=`pluginMailToEvent-event-creator-${t}`,a.className="pluginMailToEvent-event-creator";let l=document.createElement("div");l.className="pluginMailToEvent-drag-handle",a.appendChild(l);let{fragment:s,ids:c}=z(t),{fragment:u,ids:p}=L(t),g=document.createElement("div");g.className="form-group";let x=document.createElement("label");x.textContent="Start date";let v=document.createElement("input");v.id=`${t}-start-date`,v.type="datetime-local",v.value=o.dateISO.slice(0,16),g.appendChild(x),g.appendChild(v);let f=document.createElement("div");f.className="form-group";let E=document.createElement("label");E.textContent="End date";let m=document.createElement("input");m.id=`${t}-end-date`,m.type="datetime-local",m.value=r.dateISO.slice(0,16),f.appendChild(E),f.appendChild(m);let d=document.createElement("input");d.type="submit",d.id=`${t}-create-event`,d.className="pluginMailToEvent-create-btn",d.value="Create event",a.appendChild(s),a.appendChild(g),a.appendChild(f),a.appendChild(u),a.appendChild(d);let b=window.scrollX+i.clientX,$=window.scrollY+i.clientY;a.style=`position: absolute; top: ${$}px; left: ${b}px`,document.body.appendChild(a),y.set(n,a);let h=C.get(n);h?(document.getElementById(c.eventTitle).value=h.title??document.title,document.getElementById(`${t}-start-date`).value=h.startDate??v.value,document.getElementById(`${t}-end-date`).value=h.endDate??m.value,h.location&&(document.getElementById(p.eventLocation).value=h.location),h.comment&&(document.getElementById(p.eventComment).value=h.comment)):document.getElementById(c.eventTitle).value=document.title,a.addEventListener("input",()=>{C.set(n,{title:document.getElementById(c.eventTitle)?.value,startDate:document.getElementById(`${t}-start-date`)?.value,endDate:document.getElementById(`${t}-end-date`)?.value,location:document.getElementById(p.eventLocation)?.value,comment:document.getElementById(p.eventComment)?.value})}),_(a),B(document.getElementById(c.calendarSelector),document.getElementById(c.setDefaultCalendar),()=>browser.runtime.sendMessage({action:"getCalendars"})),N(document.getElementById(c.timezoneSelector),document.getElementById(c.setDefaultTimezone)),d.addEventListener("click",async()=>{let M=document.getElementById(`${t}-start-date`)?.value,I=document.getElementById(`${t}-end-date`)?.value,w=document.getElementById(c.eventTitle).value,O=document.getElementById(p.eventComment).value||"",F=document.getElementById(p.eventLocation).value||"",X=document.getElementById(c.calendarSelector)?.value,H=document.getElementById(c.timezoneSelector)?.value;if(M&&I&&w){d.disabled=!0,d.value="Creating\u2026";let T=await browser.runtime.sendMessage({action:"createCalendarEvent",calendarId:X,args:[M+":00",I+":00",w,O,H,F]});T.error?(console.error(T),d.disabled=!1,d.value="\u2717 "+(T.error?.message||"Error"),d.classList.add("error")):(d.value="\u2713 Event created",d.classList.add("success"),C.delete(n))}}),a.addEventListener("mouseleave",()=>{a.classList.add("pluginMailToEvent-event-creator--visited")},{once:!0})})}async function Z(){(await D(document)).foundHtmlElements.map(R)}Z();document.addEventListener("click",function(e){e.target.closest(".pluginMailToEvent-event-creator")||e.target.closest(".pluginMailToEvent-highlightDate")||y.forEach((o,r)=>{o.remove(),y.delete(r)})});})();
