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
          case "body": return new THREE.MeshPhysicalMaterial({ color: "#444444", reflectivity: 0.8, metalness: 0.8, });
          case "metal": return new THREE.MeshPhysicalMaterial({ color: "#bbbbbb", reflectivity: 0.1, metalness: 0.7, });
          case "glass": return new THREE.MeshPhysicalMaterial({ color: "#b3ffff", reflectivity: 0.4, metalness: 0.3, });
        }
      })();
    });
    this.model.rotation.y = THREE.Math.degToRad(180); // Model faces the wrong way; correct it.
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 5;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }
}
