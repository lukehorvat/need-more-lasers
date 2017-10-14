import * as THREE from "three";
import GameObject from "./game-object";
import Laser from "./laser";
import SlowLaser from "./slow-laser";
import FastLaser from "./fast-laser";

export default class Player extends GameObject {
  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.poweredUp = false;
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    // Shoot?
    if (this.game.keyboard.space && (!this.game.lasers.length || elapsedTime - this.game.lasers.pop().createdAt > this.laserFireRate)) {
      let laser1 = new this.laserType(this.game, elapsedTime);
      laser1.position.copy(this.getWorldPosition()).add(new THREE.Vector3(-4, -2, 0));
      laser1.lookAt(this.game.mouse.getPosition(this.game.camera.position.z - this.game.camera.far));
      this.game.scene.add(laser1);

      let laser2 = new this.laserType(this.game, elapsedTime);
      laser2.position.copy(this.getWorldPosition()).add(new THREE.Vector3(4, -2, 0));
      laser2.lookAt(this.game.mouse.getPosition(this.game.camera.position.z - this.game.camera.far));
      this.game.scene.add(laser2);

      this.game.sounds.get(this.laserType.soundName).play({ volume: 100 });
    }
  }

  get laserFireRate() {
    return this.poweredUp ? 0.2 : 0.5;
  }

  get laserType() {
    return this.poweredUp ? FastLaser : SlowLaser;
  }
}
