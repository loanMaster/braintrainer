import { Howl } from 'howler'
import {BehaviorSubject, Subject} from 'rxjs'
import {filter, take} from 'rxjs/operators'

export interface Sound {
  audio?: string;
  src?: string
  skip?: boolean;
  loop?: boolean;
}

const preload = (src: string) => {
  return new Howl({
    src: [src],
    autoplay: false,
    loop: false,
    html5: true
  })
}

export class SoundService {

  static howlSuccess: Howl
  static howlError: Howl
  static howlFail: Howl
  static howlFinished: Howl

  howls: Howl[] = []
  isPlayingSequence = false
  _isPlaying = false
  queue: Sound[] = []
  pausing: Subject<boolean> = new BehaviorSubject<boolean>(false)

  constructor() {
    if (!SoundService.howlSuccess) {
      SoundService.howlSuccess = preload('/sounds/Menu1A.ogg')
      SoundService.howlError = preload('/sounds/negative_2.ogg')
      SoundService.howlFail = preload('/sounds/game_over_bad_chest.ogg')
      SoundService.howlFinished = preload('/sounds/fuck2.ogg')
    }
  }

  isAudioContextRunning () {
    return new AudioContext().state === "running"
  }

  play (sound: Sound): Promise<void> {
    this._isPlaying = true
    return new Promise(async (resolve) => {
      await this.pausing.pipe(filter(p => !p), take(1)).toPromise()
      const howl = new Howl({
        src: [sound.audio ? 'data:audio/x-mp3;base64,' + sound.audio : sound.src as string],
        autoplay: true,
        loop: sound.loop || false,
        html5: true
      })
      this.howls.push(howl)
      howl.on('end', () => {
        if (!sound.loop) {
          this.howls.splice(this.howls.indexOf(howl), 1)
          this._isPlaying = false
          resolve()
        }
      })
      howl.on('stop', () => {
        this.howls.splice(this.howls.indexOf(howl), 1)
        this._isPlaying = false
        resolve()
      })
    })
  }

  pause (pausing: boolean) {
    this.pausing.next(pausing)
  }

  async playAll (sounds: Sound[], pauseTime = 0) {
    this.queue = []
    sounds.forEach(s => this.queue.push(JSON.parse(JSON.stringify(s))))
    this.isPlayingSequence = true
    for (const sound of this.queue) {
      if (!sound.skip) {
        await this.play(sound)
        await new Promise(resolve => setTimeout(resolve, pauseTime))
      }
    }
    this.isPlayingSequence = false
  }

  isPlaying (): boolean {
    return this.isPlayingSequence || this._isPlaying
  }

  stop () {
    for (const howl of this.howls) {
      howl.stop()
    }
    this.queue.forEach(q => { q.skip = true })
    this.queue = []
  }

  playSuccess () {
    SoundService.howlSuccess.play()
  }

  playLevelFinished () {
    SoundService.howlFinished.play()
  }

  playFail () {
    SoundService.howlFail.play()
  }

  playError () {
    SoundService.howlError.play()
  }
}
