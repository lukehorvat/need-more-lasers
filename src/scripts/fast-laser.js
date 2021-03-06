import * as THREE from "three";
import Laser from "./laser";

export default class FastLaser extends Laser {
  static modelName = "fast-laser.obj";
  static soundName = "fast-laser.ogg";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = 700;
    this.model = game.models.get(FastLaser.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#0f387a", reflectivity: 1, metalness: 0, });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 10;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    // Move the model forwards so that the back of it is at (0,0,0).
    // This ensures that when it is spawned, it is spawned from the back of the model, which looks better.
    this.model.position.z += Math.abs(this.model.position.z - this.worldToLocal(this.model.bbox.min).z);

    // Track the location of the front of the model, so we can detect collisions.
    this.frontPosition = new THREE.Vector3(0, 0, this.worldToLocal(this.model.bbox.max).z);

    this.add(this.model);
  }
}
