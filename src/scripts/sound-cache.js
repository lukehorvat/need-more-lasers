import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import { soundManager } from "soundmanager2";
import each from "promise-each";

export default class SoundCache extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  init(soundNames = []) {
    return new Promise(resolve => {
      soundManager.setup({ onready: resolve, debugMode: false, });
    }).then(() => (
      Promise.resolve(Array.from(new Set(soundNames))).then(each(soundName => this.set(soundName)))
    ));
  }

  set(soundName, sound) {
    if (sound) return super.set(soundName, sound);

    return new Promise(resolve => {
      let sound = soundManager.createSound({
        id: `sound#${soundName}`,
        url: `${this.path}/${soundName}`,
        autoLoad: true,
        onload: () => {
          this.set(soundName, sound);
          resolve();
        }
      });
    });
  }
}
