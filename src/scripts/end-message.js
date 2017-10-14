import * as THREE from "three";
import GameObject from "./game-object";

export default class EndMessage extends GameObject {
  static fontName = "passion-one.json";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.model = new THREE.Mesh();
    this.model.geometry = new THREE.TextGeometry("MISSION COMPLETE", { font: game.fonts.get(EndMessage.fontName), size: 0.5, height: 0, });
    this.model.material = new THREE.MeshToonMaterial({ color: "#00ff00", transparent: true, opacity: 0.5, });

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    this.add(this.model);
  }
}
