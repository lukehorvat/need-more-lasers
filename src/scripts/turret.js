import * as THREE from "three";

export default class Turret extends THREE.Group {
  static modelName = "turret.obj";

  constructor(modelCache) {
    super();

    this.model = modelCache.get(Turret.modelName).clone();
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body":
          case "pipe": return new THREE.MeshPhysicalMaterial({ color: "#444444", reflectivity: 0.5, metalness: 0.4, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#ff6600", reflectivity: 0.9, metalness: 0.3, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#bbbbbb", reflectivity: 0.1, metalness: 0.7, });
        }
      })();
    });
    this.model.position.x = 0;
    this.model.position.y = 0;
    this.model.position.z = 0;
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.add(this.model);
  }
}
