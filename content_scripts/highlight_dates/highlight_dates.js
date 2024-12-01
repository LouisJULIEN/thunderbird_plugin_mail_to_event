export async function highlightEmailDates() {
    console.log('ok')

    console.log(document.body)
    const res = await browser.runtime.sendMessage({
        action: 'findDOMDates',
        HTMLBody: document
    })
    console.log(res)
    return null;
}
