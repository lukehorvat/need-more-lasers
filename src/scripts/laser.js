import * as THREE from "three";

export default class Laser extends THREE.Group {
  static modelName = "laser.obj";
  static lastSpawnTime = null;

  constructor(modelCache) {
    super();

    this.speed = 500;
    this.model = modelCache.get(Laser.modelName).clone();
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#ff2121", reflectivity: 1, metalness: 0, });
    });
    this.model.position.z -= this.backPosition.z;
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 20;
    this.add(this.model);
  }

  get backPosition() {
    return new THREE.Vector3(0, 0, -58);
  }

  get frontPosition() {
    return new THREE.Vector3(0, 0, 62);
  }
}
