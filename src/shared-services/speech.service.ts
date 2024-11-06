import { useAppStore } from '../stores/app-store';

export class SpeechService {
  private queue: { text: string; meta?: any }[] = [];
  private isPlayingSequence = false;
  private abort = false;

  init() {
    if (this.speechSynthesisFacade) {
      this.speechSynthesisFacade.getVoices();
    }
  }

  get speechSynthesisFacade(): SpeechSynthesis {
    if (!(window as any).speechSynthesisFacade) {
      (window as any).speechSynthesisFacade = window.speechSynthesis;
    }
    return (window as any).speechSynthesisFacade;
  }

  async say(text: string, meta: any = {}, lang?: string): Promise<boolean> {
    if (meta) {
      useAppStore().startedPlayingSound(meta);
    }
    const p = new Promise<boolean>((resolve) => {
      const synth = this.speechSynthesisFacade;
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
      this.speechSynthesisFacade.cancel();
    }
  }

  isPlaying() {
    return (
      this.speechSynthesisFacade.pending || this.speechSynthesisFacade.speaking
    );
  }

  async isAvailable(lang: string) {
    if (!this.speechSynthesisFacade) {
      return false;
    }
    if (this.speechSynthesisFacade.getVoices().length > 0) {
      return (
        this.speechSynthesisFacade
          .getVoices()
          .filter((l) => l.lang.substring(0, 2) === lang).length > 0
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    const supported = this.speechSynthesisFacade.getVoices();
    return supported.filter((l) => l.lang.substring(0, 2) === lang).length > 0;
  }
}
