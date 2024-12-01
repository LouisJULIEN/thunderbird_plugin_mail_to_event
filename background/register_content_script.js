await messenger.scripting.registerContentScripts([{
    allFrames: true,
    id: "highlightDates-1025",
    js: ["content_scripts/highlight_dates/highlight_dates.js"],
    css: ["content_scripts/highlight_dates/highlight_dates.css"],
    matches: ["<all_urls>", "*://*/*"]
}]);


// Inject script in all every open message tabs.
let openTabs = await messenger.tabs.query();
let messageTabs = openTabs.filter(
    tab => ["mail", "messageDisplay"].includes(tab.type)
);
for (let messageTab of messageTabs) {
    await messenger.scripting.insertCSS({
        target: {tabId: messageTab.id},
        files: ["content_scripts/highlight_dates/highlight_dates.css"]
    })
    const a = await messenger.scripting.executeScript({
        target: {tabId: messageTab.id},
        files: [
            "content_scripts/highlight_dates/highlight_dates.js",
        ],
    })
}