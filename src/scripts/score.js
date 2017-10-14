import * as THREE from "three";
import GameObject from "./game-object";

export default class Score extends GameObject {
  static fontName = "passion-one.json";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.scores = [];
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    // For performance reasons, only update the text if the score changed.
    let total = this.scores.reduce((sum, score) => sum + score, 0);
    if (this.total !== total) {
      this.total = total;

      this.remove(this.model);

      this.model = new THREE.Mesh();
      this.model.geometry = new THREE.TextGeometry(`SCORE: ${this.total}`, { font: this.game.fonts.get(Score.fontName), size: 0.25, height: 0, });
      this.model.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });

      // Center the model in case it isn't already.
      this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

      this.add(this.model);
    }
  }

  increment(score) {
    this.scores.push(score);
  }
}
