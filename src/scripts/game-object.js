import * as THREE from "three";

export default class GameObject extends THREE.Group {
  constructor(game) {
    super();

    this.game = game;
  }

  spawn(elapsedTime = 0) {
    this.spawnedAt = elapsedTime;
    this.game.scene.add(this);
  }

  update(elapsedTime, delta) {
    this.updatedAt = elapsedTime;
  }
}
