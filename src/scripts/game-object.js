import * as THREE from "three";

export default class GameObject extends THREE.Group {
  constructor(game, elapsedTime = 0) {
    super();

    this.game = game;
    this.createdAt = elapsedTime;
  }

  update(elapsedTime, delta) {
    this.updatedAt = elapsedTime;
  }
}
