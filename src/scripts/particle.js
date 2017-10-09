import * as THREE from "three";

export default class Particle extends THREE.Mesh {
  constructor() {
    super();

    this.material = new THREE.MeshToonMaterial({ color: "#dddddd", transparent: true, opacity: 0.5, });
    this.geometry = new THREE.SphereGeometry(0.08, 3, 2);
  }
}
