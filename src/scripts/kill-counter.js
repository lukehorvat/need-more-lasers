import * as THREE from "three";
import GameObject from "./game-object";

export default class KillCounter extends GameObject {
  static fontName = "passion-one.json";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.count = -1;

    (this.increment = () => {
      this.count++;

      this.remove(this.model);

      this.model = new THREE.Mesh();
      this.model.geometry = new THREE.TextGeometry(`KILLS = ${this.count}`, { font: game.fonts.get(KillCounter.fontName), size: 0.25, height: 0, });
      this.model.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });

      // Center the model in case it isn't already.
      this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

      this.add(this.model);
    })();
  }
}
