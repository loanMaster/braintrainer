export class TweenService {
  setVisible(element: HTMLElement | undefined, visible: boolean) {
    if (element && element.isConnected) {
      element.style.setProperty('visibility', visible ? 'visible' : 'hidden');
    }
  }

  setDisplay(element: HTMLElement | undefined, display: string) {
    if (element && element.isConnected) {
      element.style.setProperty('display', display);
    }
  }

  async fadeOut(element: HTMLElement | undefined, duration = 0.5) {
    if (element && element.isConnected) {
      await this._animateCSS(element, 'fadeOut', duration);
      if (element.isConnected) {
        element.classList.remove('animated', 'fadeOut');
        element.style.setProperty('opacity', '0');
      }
    }
  }

  async fadeIn(element: HTMLElement | undefined, duration = 0.5) {
    if (element && element.isConnected) {
      await this._animateCSS(element, 'fadeIn', duration);
      if (element.isConnected) {
        element.classList.remove('animated', 'fadeIn');
        element.style.setProperty('opacity', '1');
      }
    }
  }

  async wiggle(element: HTMLElement | undefined, duration = 0.5) {
    if (element && element.isConnected) {
      await this._animateCSS(element, 'headShake', duration);
      if (element.isConnected) {
        element.classList.remove('animated', 'headShake');
      }
    }
  }

  async animateCSS(
    element: HTMLElement | undefined,
    animation: string,
    duration?: number
  ) {
    if (element && element.isConnected) {
      await this._animateCSS(element, animation, duration);
      if (element.isConnected) {
        element.classList.remove('animated', animation);
      }
    }
  }

  private _animateCSS(element: HTMLElement, animation: string, duration = 0.5) {
    return new Promise((resolve) => {
      const animationName = `${animation}`;

      element.classList.add('animated', animationName);
      if (duration) {
        element.style.setProperty('--animate-duration', String(duration) + 's');
      }

      function handleAnimationEnd(event: any) {
        event.stopPropagation();
        if (element.isConnected && duration) {
          element.style.removeProperty('--animate-duration');
        }
        console.log(`animation ${animationName} ended`)
        resolve('Animation ended');
      }

      element.addEventListener('animationend', handleAnimationEnd, {
        once: true,
      });
    });
  }
}
