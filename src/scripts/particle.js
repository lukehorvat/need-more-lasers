import * as THREE from "three";

export default class Particle extends THREE.Group {
  static modelName = "particle.obj";

  constructor(game) {
    super();

    this.speed = 50;
    this.model = game.models.get(Particle.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshToonMaterial({ color: "#444444" });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.1;
    this.add(this.model);
  }
}
