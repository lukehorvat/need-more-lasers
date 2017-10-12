import * as THREE from "three";
import random from "lodash.random";
import ModelCache from "./model-cache";

export default class Enemy extends THREE.Group {
  static modelName = "enemy.obj";

  constructor() {
    super();

    this.speed = random(50, 300);
    this.model = ModelCache.get(Enemy.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#202757", reflectivity: 0.8, metalness: 0.4, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#4E2F63", reflectivity: 0.1, metalness: 0.7, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#2F3563", reflectivity: 0.9, metalness: 0.3, });
        }
      })();
    });
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 2;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }
}
