import { useAppStore } from '../stores/app-store';

export class SpeechService {
  private queue: { text: string; meta?: any }[] = [];
  private isPlayingSequence = false;
  private abort = false;

  init() {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }

  async say(text: string, meta: any = {}, lang?: string): Promise<boolean> {
    if (meta) {
      useAppStore().startedPlayingSound(meta);
    }
    const p = new Promise<boolean>((resolve) => {
      const synth = window.speechSynthesis;
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
    pauseTime = 0
  ) {
    useAppStore().startedPlaySequence();
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
    useAppStore().finishedPlayingSequence();
  }

  stop() {
    if (this.isPlayingSequence) {
      this.abort = true;
    }
    if (this.isPlaying()) {
      window.speechSynthesis.cancel();
    }
  }

  isPlaying() {
    return window.speechSynthesis.pending || window.speechSynthesis.speaking;
  }

  async isAvailable() {
    if (!window.speechSynthesis) {
      return false;
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    return window.speechSynthesis.getVoices().length > 0;
  }
}
