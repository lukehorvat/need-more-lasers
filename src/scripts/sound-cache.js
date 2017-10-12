import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import { soundManager } from "soundmanager2";
import each from "promise-each";

export default class SoundCache extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  init(soundNames) {
    return Promise.resolve(Array.from(new Set(soundNames))).then(each(soundName => this.set(soundName)));
  }

  set(soundName, sound) {
    if (sound) return super.set(soundName, sound);

    return new Promise(resolve => {
      if (soundManager.ok()) resolve();
      else soundManager.setup({ onready: resolve });
    }).then(() => (
      new Promise(resolve => {
        let sound = soundManager.createSound({
          id: `sound#${soundName}`,
          url: `${this.path}/${soundName}`,
          autoLoad: true,
          onload: resolve
        });
        this.set(soundName, sound);
      })
    ));
  }
}
