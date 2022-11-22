import {SoundService} from "src/shared-services/sound.service";

export async function repeatX(ctx: any) {
  if (!ctx.soundService.isPlaying()) {
    const revealedWhenStarting = ctx.revealed.value
    ctx.inputDisabled.value = true
    await ctx.playAudio()
    if (!revealedWhenStarting) {
      ctx.inputDisabled.value = false
    }
  }
}

export function createExerciseContext() {
  return { soundService: new SoundService(), inputDisabled: true }
}
