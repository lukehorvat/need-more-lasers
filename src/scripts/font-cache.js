import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import each from "promise-each";

export default class FontCache extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  init(fontNames = []) {
    return Promise.resolve(Array.from(new Set(fontNames))).then(each(fontName => this.set(fontName)));
  }

  set(fontName, font) {
    if (font) return super.set(fontName, font);

    return new Promise(resolve => {
      let loader = new THREE.FontLoader();
      loader.load(`${this.path}/${fontName}`, font => {
        this.set(fontName, font);
        resolve();
      });
    });
  }
}
