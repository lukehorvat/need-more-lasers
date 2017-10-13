import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";

export default class Enemy extends GameObject {
  static explosionSoundName = "explosion.ogg";

  spawn(elapsedTime) {
    super.spawn(elapsedTime);

    this.lookAt(new THREE.Vector3(random(-500, 500), random(-200, 200), this.game.camera.position.z));
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z < this.game.camera.position.z) {
      this.position.addScaledVector(this.getWorldDirection(), this.speed * delta);
    } else {
      this.game.scene.remove(this);
    }
  }
}
