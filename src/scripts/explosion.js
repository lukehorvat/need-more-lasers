import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";

export default class Explosion extends GameObject {
  static modelName = "explosion.obj";
  static soundName = "explosion.ogg";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = 200;

    // Use the same material for all particles; better performance.
    this.material = new THREE.MeshPhysicalMaterial({ color: "#ff9100", transparent: true, opacity: 1 });

    for (let i = 0; i < 15; i++) {
      let particle = game.models.get(Explosion.modelName);
      particle.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
        mesh.material = this.material;
      });
      particle.scale.x = particle.scale.y = particle.scale.z = random(2, 10);
      particle.rotation.x = THREE.Math.degToRad(random(0, 360));
      particle.rotation.y = THREE.Math.degToRad(random(0, 360));
      particle.rotation.z = THREE.Math.degToRad(random(0, 360));
      this.add(particle);
    }
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    this.material.opacity -= 0.01;

    if (this.material.opacity > 0) {
      this.children.forEach(particle => {
        particle.position.addScaledVector(particle.getWorldDirection(), this.speed * delta);
      });
    } else {
      this.game.scene.remove(this);
    }
  }
}
