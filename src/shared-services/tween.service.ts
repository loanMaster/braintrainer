import gsap from 'gsap'

export class TweenService {
  async fadeOut (element: HTMLElement | string, duration = 0.5) {
    await gsap.to(element, { opacity: 0, duration })
  }

  async fadeIn (element: HTMLElement | string, duration = 0.5) {
    await gsap.to(element, { opacity: 1, duration })
  }

  async wiggle (element: HTMLElement | string) {
    await gsap.to(element, { x: '+=20', duration: 0.1 })
    await gsap.to(element, { x: '-=20', duration: 0.1 })
    await gsap.to(element, { x: '+=20', duration: 0.1 })
    await gsap.to(element, { x: '-=20', duration: 0.1 })
    await gsap.to(element, { x: '+=10', duration: 0.1 })
    await gsap.to(element, { x: '-=10', duration: 0.1 })
    await gsap.to(element, { x: '=0', duration: 0.1 })
  }
}
