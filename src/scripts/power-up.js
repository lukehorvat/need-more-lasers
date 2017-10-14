import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";

export default class PowerUp extends GameObject {
  static modelName = "power-up.obj";
  static acquireSoundName = "power-up.ogg";
  static enableSoundName = "upgrade.ogg";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = random(150, 300);
    this.model = game.models.get(PowerUp.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#1d5cc2", reflectivity: 0.7, metalness: 0.6 });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 10;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z < this.game.camera.position.z) {
      this.position.addScaledVector(this.getWorldDirection(), this.speed * delta);
      this.model.rotation.y += THREE.Math.degToRad(180) * delta;
    } else {
      this.game.scene.remove(this);
    }
  }
}
