import * as THREE from "three";
import GameObject from "./game-object";

export default class Time extends GameObject {
  static fontName = "passion-one.json";
  static maxSeconds = 300;

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    // For performance reasons, only update the text once per second.
    let remainingSeconds = Math.ceil(this.createdAt + Time.maxSeconds - elapsedTime);
    if (this.remainingSeconds !== remainingSeconds) {
      this.remainingSeconds = remainingSeconds;

      this.remove(this.model);

      this.model = new THREE.Mesh();
      this.model.geometry = new THREE.TextGeometry(`TIME: ${this.remainingSeconds}`, { font: this.game.fonts.get(Time.fontName), size: 0.25, height: 0, });
      this.model.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });

      // Center the model in case it isn't already.
      this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

      this.add(this.model);
    }
  }
}
