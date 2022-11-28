import { Subject } from 'rxjs';

document.addEventListener('keydown', function (event) {
  keyInput.next(event);
});

export const keyInput = new Subject<KeyboardEvent>();
