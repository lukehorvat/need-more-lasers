import * as THREE from "three";
import random from "lodash.random";
import Enemy from "./enemy";

export default class FastEnemy extends Enemy {
  static modelName = "fast-enemy.obj";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = random(150, 250);
    this.score = 50;
    this.model = game.models.get(FastEnemy.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#202757", reflectivity: 0.8, metalness: 0.8, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#4e2f63", reflectivity: 0.1, metalness: 0.7, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#2f3563", reflectivity: 0.9, metalness: 0.5, });
        }
      })();
    });
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 1;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }
}
