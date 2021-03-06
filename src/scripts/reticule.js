import * as THREE from "three";
import GameObject from "./game-object";

export default class Reticule extends GameObject {
  static modelName = "reticule.obj";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.model = game.models.get(Reticule.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.7;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    this.position.copy(this.game.mouse.getPosition(this.game.camera.position.z - 10));
    this.lookAt(this.game.camera.position);
  }
}
