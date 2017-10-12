import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import { soundManager } from "soundmanager2";
import each from "promise-each";

class SoundCache extends Map {
  init(soundNames) {
    return Promise.resolve(soundNames).then(each(soundName => this.set(soundName)));
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
          url: `sounds/${soundName}`,
          autoLoad: true,
          onload: resolve
        });
        this.set(soundName, sound);
      })
    ));
  }
}

export default new SoundCache();
