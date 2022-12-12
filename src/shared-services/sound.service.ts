import { Howl } from 'howler';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { useAppStore } from 'stores/app-store';
import {preloadAudio} from "src/util/preload-images";

export interface Sound {
  audio?: string;
  src?: string;
  skip?: boolean;
  loop?: boolean;
  tag?: string;
}

const preload = (src: string) => {
  return new Howl({
    src: [src],
    autoplay: false,
    loop: false,
    html5: true,
  });
};

const loadedSounds: { [key: string]: Howl } = {};

export class SoundService {
  howls: Howl[] = [];
  isPlayingSequence = false;
  private deactivated = false;
  _isPlaying = false;
  queue: Sound[] = [];
  pausing: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private soundsToPreload: { [key: string]: string } = {
    success: '/sounds/Menu1A.ogg',
    error: '/sounds/negative_2.ogg',
    finished: '/sounds/finished.ogg',
  };

  preCacheSounds() {
    return preloadAudio(Object.values(this.soundsToPreload))
  }

  private getSound(sound: string) {
    if (!loadedSounds[sound]) {
      loadedSounds[sound] = preload(this.soundsToPreload[sound]);
    }
    return loadedSounds[sound];
  }

  async play(sound: Sound): Promise<void> {
    this._isPlaying = true;
    await this.pausing
      .pipe(
        filter((p) => !p),
        take(1)
      )
      .toPromise();
    const howl = new Howl({
      src: [
        sound.audio
          ? 'data:audio/x-mp3;base64,' + sound.audio
          : (sound.src as string),
      ],
      autoplay: false,
      loop: sound.loop || false,
      html5: true,
    });
    useAppStore().startedPlayingSound(sound.tag);
    await this.playHowl(howl);
    useAppStore().finishedPlayingSound(sound.tag);
  }

  private playHowl(howl: Howl, loop = false): Promise<void> {
    if (this.deactivated) {
      return new Promise((resolve) => resolve);
    }
    this._isPlaying = true;
    return new Promise(async (resolve) => {
      howl.on('end', () => {
        if (!loop) {
          this.howls.splice(this.howls.indexOf(howl), 1);
          this._isPlaying = false;
          resolve();
        }
      });
      howl.on('stop', () => {
        this.howls.splice(this.howls.indexOf(howl), 1);
        this._isPlaying = false;
        resolve();
      });
      this.howls.push(howl);
      howl.play();
    });
  }

  pause(pausing: boolean) {
    this.pausing.next(pausing);
  }

  async playAll(sounds: Sound[], pauseTime = 0) {
    useAppStore().$patch(
      (store) => (store.exercise.audioState.playingSequence = true)
    );
    this.queue = [];
    sounds.forEach((s) => this.queue.push(JSON.parse(JSON.stringify(s))));
    this.isPlayingSequence = true;
    for (const sound of this.queue) {
      if (!sound.skip) {
        await this.play(sound);
        await new Promise((resolve) => setTimeout(resolve, pauseTime));
      }
    }
    this.isPlayingSequence = false;
    useAppStore().$patch(
      (store) => (store.exercise.audioState.playingSequence = false)
    );
  }

  isPlaying(): boolean {
    return this.isPlayingSequence || this._isPlaying;
  }

  stop() {
    for (const howl of this.howls) {
      howl.stop();
    }
    this.queue.forEach((q) => {
      q.skip = true;
    });
    this.queue = [];
  }

  deactivate() {
    this.deactivated = true;
  }

  playSuccess() {
    return this.getSound('success').play();
  }

  playLevelFinished() {
    return this.getSound('finished').play();
  }

  playError() {
    return this.getSound('error').play();
  }
}
