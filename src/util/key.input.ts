import { Subject } from 'rxjs';

document.addEventListener('keydown', function (event) {
  keyInput.next(event as KeyboardEvent);
});

export const keyInput = new Subject<KeyboardEvent>();
