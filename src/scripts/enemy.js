import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";

export default class Enemy extends GameObject {
  static killSoundNames = [
    "eliminated.ogg",
    "fantastic.ogg",
    "flawless.ogg",
    "godlike.ogg",
    "perfect.ogg",
    "perfection.ogg",
    "success.ogg",
    "target-destroyed.ogg",
    "target-eliminated.ogg",
    "untouchable.ogg",
    "well-done.ogg",
  ];

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z < this.game.camera.position.z) {
      this.position.addScaledVector(this.getWorldDirection(), this.speed * delta);
    } else {
      this.game.scene.remove(this);
    }
  }
}
