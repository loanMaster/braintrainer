export class TweenService {

  setVisible(element: HTMLElement, visible: boolean) {
    element.style.setProperty('visibility', visible ? 'visible' : 'hidden')
  }

  setDisplay(element: HTMLElement, display: string) {
    element.style.setProperty('display', display)
  }

  async fadeOut (element: HTMLElement, duration = 0.5) {
    await this._animateCSS(element, 'fadeOut', duration)
    element.classList.remove(`animated`, 'fadeOut');
    element.style.setProperty('opacity', '0')
  }

  async fadeIn (element: HTMLElement, duration = 0.5) {
    await this._animateCSS(element, 'fadeIn', duration)
    element.classList.remove(`animated`, 'fadeIn');
    element.style.setProperty('opacity', '1')
  }

  async wiggle (element: HTMLElement, duration = 0.5) {
    await this._animateCSS(element, 'headShake')
    element.classList.remove(`animated`, 'headShake');
  }

  async animateCSS (element: HTMLElement, animation: string, duration?: number) {
    await this._animateCSS(element, animation, duration)
    element.classList.remove(`animated`, animation);
  }

  private _animateCSS (element: HTMLElement, animation: string, duration = 0.5) {
    return new Promise((resolve, reject) => {
      const animationName = `${animation}`;

      element.classList.add(`animated`, animationName);
      if (duration) {
        element.style.setProperty('--animate-duration', String(duration) + 's')
      }

      function handleAnimationEnd(event: any) {
        event.stopPropagation();
        if (duration) {
          element.style.removeProperty('--animate-duration')
        }

        resolve('Animation ended');
      }

      element.addEventListener('animationend', handleAnimationEnd, {once: true});
    });
  }
}
