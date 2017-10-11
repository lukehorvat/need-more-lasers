import * as THREE from "three";
import ModelCache from "./model-cache";

export default class Turret extends THREE.Group {
  static modelName = "turret.obj";

  constructor() {
    super();

    this.speed = 60;
    this.model = ModelCache.get(Turret.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body":
          case "pipe": return new THREE.MeshPhysicalMaterial({ color: "#444444", reflectivity: 0.5, metalness: 0.4, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#bbbbbb", reflectivity: 0.1, metalness: 0.7, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#ff6600", reflectivity: 0.9, metalness: 0.3, });
        }
      })();
    });
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.add(this.model);
  }

  get leftGunPosition() {
    return new THREE.Vector3(5, 0.5, 4);
  }

  get rightGunPosition() {
    return new THREE.Vector3(-5, 0.5, 4);
  }
}
