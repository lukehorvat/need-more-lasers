import oscillators from "web-audio-oscillators";
import Reverb from "soundbank-reverb";

export function laser(audioCtx) {
  let gain = audioCtx.createGain();
  gain.gain.value = 0.5;

  let reverb = Reverb(audioCtx);
  reverb.time = 1;
  reverb.wet.value = 0.8;
  reverb.dry.value = 0.6;

  let oscillator = oscillators.chiptune(audioCtx);
  oscillator.connect(gain).connect(reverb).connect(audioCtx.destination);
  oscillator.frequency.setValueAtTime(oscillator.frequency.maxValue, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.2);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.23);
}
