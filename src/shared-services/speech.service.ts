import { BehaviorSubject, filter, Subject, take } from 'rxjs';
import { useAppStore } from '../stores/app-store';

export class SpeechService {
  private queue: { text: string; meta?: any }[] = [];
  private isPlayingSequence = false;
  private abort = false;
  pausing: Subject<boolean> = new BehaviorSubject<boolean>(false);

  async say(text: string, meta: any = {}, lang?: string): Promise<boolean> {
    if (meta) {
      useAppStore().startedPlayingSound(meta);
    }
    await this.pausing
      .pipe(
        filter((p) => !p),
        take(1)
      )
      .toPromise();
    const p = new Promise<boolean>((resolve, reject) => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onerror = () => {
        resolve(false);
      };
      utterThis.onend = () => {
        if (meta) {
          useAppStore().finishedPlayingSound(meta);
        }
        resolve(true);
      };
      utterThis.lang = lang || useAppStore().language;
      synth.speak(utterThis);
    });
    return p;
  }

  async playAll(
    texts: ({ text: string; meta?: any } | string)[],
    pauseTime = 0,
    measureTime = false
  ) {
    useAppStore().startedPlaySequence(measureTime);
    this.queue = texts.map((s) => (typeof s === 'string' ? { text: s } : s));
    this.isPlayingSequence = true;
    for (const sound of this.queue) {
      if (!this.abort) {
        await this.say(sound.text, sound.meta);
      }
      if (!this.abort) {
        await new Promise((resolve) => setTimeout(resolve, pauseTime));
      }
    }
    this.isPlayingSequence = false;
    this.abort = false;
    useAppStore().finishedPlayingSequence(measureTime);
  }

  pause(pausing: boolean) {
    this.pausing.next(pausing);
  }

  stop() {
    if (this.isPlayingSequence) {
      this.abort = true;
    }
    window.speechSynthesis.cancel();
  }

  isPlaying() {
    return window.speechSynthesis.pending || window.speechSynthesis.speaking;
  }
}
