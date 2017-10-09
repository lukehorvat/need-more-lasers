import * as THREE from "three";

export default class Laser extends THREE.Mesh {
  static lastSpawnTime = null;

  constructor() {
    super();

    this.material = new THREE.MeshPhysicalMaterial({ color: "#ff2121", reflectivity: 1, metalness: 0, });
    this.geometry = new THREE.BoxGeometry(1.2, 1.2, 100);
  }
}
