/**
 * Loads a Fathom instance into the page
 * @param siteId The site id to use
 * @returns
 */
export function loadFathom(siteId: string) {
  return new Promise<void>(resolve => {
    const fathomSourceURL = 'https://cdn.usefathom.com/script.js'

    const prevScript = document.querySelector(`script[src="${fathomSourceURL}"]`)

    if (prevScript) {
      console.warn('Fathom is already in window')
      return resolve()
    }

    const script = document.createElement('script')
    script.setAttribute('data-site', siteId)
    script.setAttribute('data-auto', 'true')
    script.setAttribute('data-spa', 'hash')
    script.onload = () => resolve
    script.defer = true
    script.src = fathomSourceURL
    document.body.appendChild(script)
  })
}
