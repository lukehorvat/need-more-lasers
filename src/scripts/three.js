/*
  A module providing custom extensions to three.js!
*/

import * as THREE from "three";

export function install() {
  // A function to compute the bounding box of an object.
  Object.defineProperty(THREE.Object3D.prototype, "bbox", {
    get: function() {
      return new THREE.Box3().setFromObject(this);
    }
  });

  // A function to compute the visible rectangle at a given depth.
  // See: https://stackoverflow.com/q/13350875
  Object.defineProperty(THREE.Camera.prototype, "visibleRect", {
    value: function(z) {
      let distance = Math.abs(z - this.position.z);
      let height = 2 * Math.tan(THREE.Math.degToRad(this.fov) / 2) * distance;
      let width = height * this.aspect;

      return new THREE.Box2(
        new THREE.Vector2(-width / 2, -height / 2),
        new THREE.Vector2(width / 2, height / 2),
      );
    }
  });
}
