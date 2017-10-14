import * as THREE from "three";
import random from "lodash.random";
import Enemy from "./enemy";

export default class SlowEnemy extends Enemy {
  static modelName = "slow-enemy.obj";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = random(50, 100);
    this.score = 10;
    this.model = game.models.get(SlowEnemy.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = (() => {
        switch (mesh.name) {
          case "pipe":
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#202757", reflectivity: 0.8, metalness: 0.8, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#4e2f63", reflectivity: 0.1, metalness: 0.7, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#2f3563", reflectivity: 0.9, metalness: 0.5, });
        }
      })();
    });
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.model.scale.x = this.model.scale.y = this.model.scale.z = random(3, 6);

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }
}
