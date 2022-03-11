function insertInnerHTML(element, innerHTML) {
    element.innerHTML = innerHTML;
}

function linkStylesheet(path) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', path)
    document.querySelector('head').appendChild(link)
}

export {
    insertInnerHTML,
    linkStylesheet
}