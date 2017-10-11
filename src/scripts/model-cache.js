import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import each from "promise-each";

OBJLoader(THREE);

class ModelCache extends Map {
  init(modelNames) {
    return Promise.resolve(modelNames).then(each(modelName => this.set(modelName)));
  }

  get(key) {
    let value = super.get(key);
    if (value) value = value.clone();
    return value;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise(resolve => {
      let loader = new THREE.OBJLoader();
      loader.load(`models/${key}`, model => {
        this.set(key, model);
        resolve();
      });
    });
  }
}

export default new ModelCache();
