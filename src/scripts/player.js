import * as THREE from "three";
import GameObject from "./game-object";
import Gun from "./gun";
import Laser from "./laser";

export default class Player extends GameObject {
  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.leftGun = new Gun(game);
    this.leftGun.position.copy(new THREE.Vector3(-6, 0, -8));
    this.add(this.leftGun);

    this.rightGun = new Gun(game);
    this.rightGun.position.copy(new THREE.Vector3(6, 0, -8));
    this.add(this.rightGun);
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    this.lookAt(this.game.mouse.getPosition(this.game.maxWorldDepth));

    // Shoot?
    if (this.game.keyboard.space && (!this.game.lasers.length || elapsedTime - this.game.lasers.pop().createdAt > 0.2)) {
      let laser1 = new Laser(this.game, elapsedTime);
      laser1.position.copy(this.leftGun.localToWorld(this.leftGun.frontPosition.clone()));
      laser1.rotation.copy(this.getWorldRotation());
      this.game.scene.add(laser1);

      let laser2 = new Laser(this.game, elapsedTime);
      laser2.position.copy(this.rightGun.localToWorld(this.rightGun.frontPosition.clone()));
      laser2.rotation.copy(this.getWorldRotation());
      this.game.scene.add(laser2);

      this.game.sounds.get(Laser.fireSoundName).play({ volume: 100 });
    }
  }
}
