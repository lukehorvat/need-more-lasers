import * as THREE from "three";

export default class Particle extends THREE.Group {
  constructor() {
    super();

    this.speed = 50;
    this.model = new THREE.Mesh();
    this.model.geometry = new THREE.SphereGeometry(0.08, 3, 2);
    this.model.material = new THREE.MeshToonMaterial({ color: "#dddddd", transparent: true, opacity: 0.5, });
    this.add(this.model);
  }
}
