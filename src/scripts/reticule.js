import * as THREE from "three";

export default class Reticule extends THREE.Group {
  static modelName = "reticule.obj";

  constructor(modelCache) {
    super();

    this.model = modelCache.get(Reticule.modelName).clone();
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.7, });
    });
    this.model.position.x = 0;
    this.model.position.y = 0;
    this.model.position.z = 0;
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 2;
    this.add(this.model);
  }
}
