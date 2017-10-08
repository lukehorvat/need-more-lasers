/*
  A module providing custom extensions to three.js!
*/

import * as THREE from "three";

export function install() {
  Object.defineProperty(THREE.Object3D.prototype, "bbox", {
    get: function() {
      return new THREE.Box3().setFromObject(this);
    }
  });
}
