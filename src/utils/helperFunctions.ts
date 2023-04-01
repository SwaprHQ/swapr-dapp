export const scrollTo = (targetId: string) => {
  const el = document.getElementById(targetId)
  if (el) {
    el.scrollIntoView()
  }
}

export const toClassName = (value: string) => value?.toLowerCase().split(' ').join('-') ?? ''

const listenToScroll = (callbackFn: (pos: number) => void) => {
  callbackFn(window.scrollY)
}

export const watchPosition = (callbackFn: (pos: number) => void) => {
  window.addEventListener('scroll', () => {
    listenToScroll(callbackFn)
  })
}
