import * as THREE from "three";
import GameObject from "./game-object";

export default class Gun extends GameObject {
  static modelName = "gun.obj";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.model = game.models.get(Gun.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#232323", reflectivity: 0.5, metalness: 0.4, });
          case "front": return new THREE.MeshPhysicalMaterial({ color: "#151515", reflectivity: 0.5, metalness: 0.4, });
        }
      })();
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 1.5;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    // Track the location of the front of the model, so we know where to spawn projectiles.
    this.frontPosition = new THREE.Vector3(0, 0, this.worldToLocal(this.model.bbox.max).z);

    this.add(this.model);
  }
}
