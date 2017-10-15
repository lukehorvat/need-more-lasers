import * as THREE from "three";
import GameObject from "./game-object";

export default class Time extends GameObject {
  static fontName = "passion-one.json";
  static maxSeconds = 300;

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.remainingSeconds = this.computeRemainingSeconds(elapsedTime);
    this.replaceText();
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    // For performance reasons, only update the text once per second.
    let remainingSeconds = this.computeRemainingSeconds(elapsedTime);
    if (this.remainingSeconds !== remainingSeconds) {
      this.remainingSeconds = remainingSeconds;
      this.replaceText();
    }
  }

  replaceText() {
    this.remove(this.text);

    this.text = new THREE.Mesh();
    this.text.geometry = new THREE.TextGeometry(`TIME: ${this.remainingSeconds}`, { font: this.game.fonts.get(Time.fontName), size: 0.25, height: 0, });
    this.text.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });

    // Center the model in case it isn't already.
    this.text.bbox.getCenter(this.text.position).multiplyScalar(-1);

    this.add(this.text);
  }

  computeRemainingSeconds(elapsedTime) {
    return Math.ceil(this.createdAt + Time.maxSeconds - elapsedTime);
  }
}
