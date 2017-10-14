import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import each from "promise-each";

OBJLoader(THREE);

export default class ModelCache extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  init(modelNames = []) {
    return Promise.resolve(Array.from(new Set(modelNames))).then(each(modelName => this.set(modelName)));
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
      loader.load(`${this.path}/${modelName}`, model => {
        this.set(modelName, model);
        resolve();
      });
    });
  }
}
