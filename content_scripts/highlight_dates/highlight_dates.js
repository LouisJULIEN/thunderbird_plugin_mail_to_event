async function highlightEmailDates() {
    const res = await browser.runtime.sendMessage({
        action: 'tagDates',
        innerHTML: document.body.innerHTML,
        textContent: document.body.textContent,
    })
    document.body.innerHTML = res.modifiedMailInnerHTML
    return null;
}

highlightEmailDates()