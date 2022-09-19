/**
 * Loads a Fathom instance into the page
 * @param siteId The site id to use
 * @param url The URL to load the Fathom instance from. Defaults to the Fathom CDN
 * @returns
 */
export function loadFathom(siteId: string, scriptURL = 'https://cdn.usefathom.com/script.js') {
  return new Promise<void>(resolve => {
    const prevScript = document.querySelector(`script[src="${scriptURL}"]`)

    if (prevScript) {
      console.warn('Fathom is already in window')
      return resolve()
    }

    const script = document.createElement('script')
    script.setAttribute('data-site', siteId)
    script.setAttribute('data-auto', 'true')
    script.setAttribute('data-spa', 'hash')
    script.onload = () => resolve()
    script.defer = true
    script.src = scriptURL
    document.body.appendChild(script)
  })
}
