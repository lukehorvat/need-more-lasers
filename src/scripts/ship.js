import * as THREE from "three";

export default class Ship extends THREE.Group {
  static modelName = "ship.obj";

  constructor(modelCache) {
    super();

    this.model = modelCache.get(Ship.modelName).clone();
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body":
          case "pipe": return new THREE.MeshPhysicalMaterial({ color: "#005eff", reflectivity: 0.5, metalness: 0.4 });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#ffc400", reflectivity: 0.9, metalness: 0.3 });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#003691", reflectivity: 0.1, metalness: 0.7 });
        }
      })();
    });
    this.model.position.x = 0;
    this.model.position.y = 0;
    this.model.position.z = 0;
    this.add(this.model);
  }
}
