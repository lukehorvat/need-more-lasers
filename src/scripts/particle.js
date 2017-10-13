import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";

export default class Particle extends GameObject {
  static modelName = "particle.obj";

  constructor(game) {
    super(game);

    this.speed = 50;
    this.model = game.models.get(Particle.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshToonMaterial({ color: "#444444" });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.1;
    this.add(this.model);
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z < this.game.camera.position.z) {
      this.position.z += this.speed * delta;
      this.rotation.z += THREE.Math.degToRad(360) * delta;
    } else {
      this.game.scene.remove(this);
    }
  }
}
