import * as THREE from "three";

export default class Mouse extends THREE.Vector2 {
  constructor(renderer, camera) {
    super();

    this.camera = camera;

    window.addEventListener("mousemove", event => {
      // Convert mouse position to Normalized Device Coordinates.
      // See: https://www.youtube.com/watch?v=Ck1SH7oYRFM
      this.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      this.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    }, false);
  }

  getPosition(z) {
    // Since the mouse only exists in 2D space, this handy function computes its
    // position at a given depth. See: https://stackoverflow.com/a/13091694
    let vector = new THREE.Vector3(this.x, this.y);
    vector.unproject(this.camera);
    let dir = vector.sub(this.camera.position).normalize();
    let distance = (z - this.camera.position.z) / dir.z;
    return this.camera.position.clone().add(dir.multiplyScalar(distance));
  }
}
