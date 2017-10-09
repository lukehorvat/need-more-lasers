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

  Object.defineProperty(THREE.Camera.prototype, "mouseToWorldPosition", {
    value: function(mouseX, mouseY, z) {
      // See: https://stackoverflow.com/a/13091694
      let vector = new THREE.Vector3(mouseX, mouseY);
      vector.unproject(this);
      let dir = vector.sub(this.position).normalize();
      let distance = (z - this.position.z) / dir.z;
      return this.position.clone().add(dir.multiplyScalar(distance));
    }
  });
}
