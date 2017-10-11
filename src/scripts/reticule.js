import * as THREE from "three";
import ModelCache from "./model-cache";

export default class Reticule extends THREE.Group {
  static modelName = "reticule.obj";

  constructor() {
    super();

    this.model = ModelCache.get(Reticule.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.7, });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.25;
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1); // Model isn't centered; correct it.
    this.add(this.model);

    this.line = new THREE.Line();
    this.line.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.7, });
    this.line.geometry = new THREE.Geometry();
    this.add(this.line);
  }
}
