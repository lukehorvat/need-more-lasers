import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import each from "promise-each";

OBJLoader(THREE);

class ModelCache extends Map {
  init(modelNames) {
    return Promise.resolve(modelNames).then(each(modelName => this.set(modelName)));
  }

  get(modelName) {
    let model = super.get(modelName);
    if (model) model = model.clone();
    return model;
  }

  set(modelName, model) {
    if (model) return super.set(modelName, model);

    return new Promise(resolve => {
      let loader = new THREE.OBJLoader();
      loader.load(`models/${modelName}`, model => {
        this.set(modelName, model);
        resolve();
      });
    });
  }
}

export default new ModelCache();
