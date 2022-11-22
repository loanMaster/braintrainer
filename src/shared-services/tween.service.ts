export class TweenService {

  setVisible(element: HTMLElement, visible: boolean) {
    element.style.setProperty('visibility', visible ? 'visible' : 'hidden')
  }

  async fadeOut (element: HTMLElement, duration = 0.5) {
    this.animateCSS(element, 'fadeOut', false, duration)
  }

  async fadeIn (element: HTMLElement, duration = 0.5) {
    this.animateCSS(element, 'fadeIn', false, duration)
  }

  async wiggle (element: HTMLElement) {
    this.animateCSS(element, 'headShake', true)
  }

  animateCSS (element: HTMLElement, animation: string, resetAfter: boolean, duration?: number) {
    new Promise((resolve, reject) => {
      const animationName = `${animation}`;

      element.classList.remove(...element.getAttribute('x-animation')?.split(',') || '')
      element.setAttribute('x-animation', animationName)
      element.classList.add(`animated`, animationName);
      if (duration) {
        element.style.setProperty('--animate-duration', String(duration) + 's')
      }

      function handleAnimationEnd(event: any) {
        event.stopPropagation();
        if (duration) {
          element.style.removeProperty('--animate-duration')
        }
        if (resetAfter) {
          element.classList.remove(`animated`, animationName);
          element.removeAttribute('x-animation')
        }
        resolve('Animation ended');
      }

      element.addEventListener('animationend', handleAnimationEnd, {once: true});
    });
  }
}
