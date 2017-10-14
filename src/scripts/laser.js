import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";
import Enemy from "./enemy";
import Explosion from "./explosion";
import PowerUp from "./power-up";

export default class Laser extends GameObject {
  static modelName = "laser.obj";
  static fireSoundName = "laser.ogg";

  constructor(game, elapsedTime) {
    super(game, elapsedTime);

    this.speed = 500;
    this.model = game.models.get(Laser.modelName);
    this.model.children.filter(child => child instanceof THREE.Mesh).forEach(mesh => {
      mesh.material = new THREE.MeshPhysicalMaterial({ color: "#ff2121", reflectivity: 1, metalness: 0, });
    });
    this.model.scale.x = this.model.scale.y = this.model.scale.z = 10;

    // Center the model in case it isn't already.
    this.model.bbox.getCenter(this.model.position).multiplyScalar(-1);

    // Move the model forwards so that the back of it is at (0,0,0).
    // This ensures that when it is spawned, it is spawned from the back of the model, which looks better.
    this.model.position.z += Math.abs(this.model.position.z - this.worldToLocal(this.model.bbox.min).z);

    // Track the location of the front of the model, so we can detect collisions.
    this.frontPosition = new THREE.Vector3(0, 0, this.worldToLocal(this.model.bbox.max).z);

    this.add(this.model);
  }

  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z > this.game.camera.position.z - this.game.camera.far) {
      this.position.addScaledVector(this.getWorldDirection(), this.speed * delta);

      // Did the laser hit an enemy?
      let enemy = this.game.enemies.find(enemy => enemy.bbox.containsPoint(this.localToWorld(this.frontPosition.clone())));
      if (enemy) {
        this.game.scene.remove(this, enemy);
        this.game.killCounter.increment();
        this.game.sounds.get(Explosion.soundName).play({ volume: random(20, 40) });

        let explosion = new Explosion(this.game, elapsedTime);
        explosion.position.copy(enemy.getWorldPosition());
        this.game.scene.add(explosion);

        if (random(0, 100) < 15) {
          let soundName = Enemy.killSoundNames[random(0, Enemy.killSoundNames.length - 1)];
          setTimeout(() => this.game.sounds.get(soundName).play({ volume: 80 }), 1000);
        }
      } else {
        // Did the laser hit a power-up?
        let powerUp = this.game.powerUps.find(powerUp => powerUp.bbox.containsPoint(this.localToWorld(this.frontPosition.clone())));
        if (powerUp) {
          this.game.scene.remove(this, powerUp);
          this.game.sounds.get(PowerUp.acquireSoundName).play({ volume: 40 });
          this.game.player.poweredUp = true;
          setTimeout(() => this.game.sounds.get(PowerUp.enableSoundName).play({ volume: 80 }), 1000);
          setTimeout(() => this.game.player.poweredUp = false, 20000);
        }
      }
    } else {
      this.game.scene.remove(this);
    }
  }
}
