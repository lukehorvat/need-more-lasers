import * as THREE from "three";
import ModelCache from "./model-cache";

export default class Gun extends THREE.Group {
  static modelName = "gun.obj";

  constructor() {
    super();

    this.speed = 60;
    this.model = ModelCache.get(Gun.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#232323", reflectivity: 0.5, metalness: 0.4, });
          case "front": return new THREE.MeshPhysicalMaterial({ color: "#151515", reflectivity: 0.5, metalness: 0.4, });
        }
      })();
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.5;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    // Move the model forwards so that the back of it is at (0,0,0).
    // This ensures that when it moves, it pivots from the back of the model, which looks better.
    this.model.position.z += Math.abs(this.worldToLocal(this.model.position).z - this.worldToLocal(this.model.bbox.min).z);

    // Track the location of the front of the model, so we know where to spawn projectiles.
    this.frontPosition = new THREE.Vector3(0, 0, this.worldToLocal(this.model.bbox.max).z);

    this.add(this.model);
  }
}
