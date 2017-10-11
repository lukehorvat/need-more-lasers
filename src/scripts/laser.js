import * as THREE from "three";
import ModelCache from "./model-cache";

export default class Laser extends THREE.Group {
  static modelName = "laser.obj";
  static range = 2000;

  constructor() {
    super();

    this.speed = 800;
    this.model = ModelCache.get(Laser.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#ff2121", reflectivity: 1, metalness: 0, });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 20;
    this.model.position.z += Math.abs(this.model.position.z - this.worldToLocal(this.model.bbox.min).z);
    this.add(this.model);
  }
}
