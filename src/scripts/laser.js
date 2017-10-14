import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";
import Enemy from "./enemy";
import Explosion from "./explosion";
import PowerUp from "./power-up";

export default class Laser extends GameObject {
  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.getWorldPosition().z > this.game.camera.position.z - this.game.camera.far) {
      this.position.addScaledVector(this.getWorldDirection(), this.speed * delta);

      // Did the laser hit an enemy?
      let enemy = this.game.enemies.find(enemy => enemy.bbox.containsPoint(this.localToWorld(this.frontPosition.clone())));
      if (enemy) {
        this.game.scene.remove(this, enemy);
        this.game.score.increment(enemy.score);
        this.game.sounds.get(Explosion.soundName).play({ volume: random(20, 40) });

        let explosion = new Explosion(this.game, elapsedTime);
        explosion.position.copy(enemy.getWorldPosition());
        this.game.scene.add(explosion);

        if (random(0, 100) < 10) {
          let soundName = Enemy.killSoundNames[random(0, Enemy.killSoundNames.length - 1)];
          setTimeout(() => this.game.sounds.get(soundName).play({ volume: 80 }), 1000);
        }
      } else {
        // Did the laser hit a power-up?
        let powerUp = this.game.powerUps.find(powerUp => powerUp.bbox.containsPoint(this.localToWorld(this.frontPosition.clone())));
        if (powerUp) {
          this.game.scene.remove(this, powerUp);
          this.game.score.increment(powerUp.score);
          this.game.sounds.get(PowerUp.acquireSoundName).play({ volume: 40 });
          this.game.player.poweredUp = true;
          setTimeout(() => this.game.sounds.get(PowerUp.enableSoundName).play({ volume: 80 }), 1000);
          setTimeout(() => this.game.player.poweredUp = false, 15000);
        }
      }
    } else {
      this.game.scene.remove(this);
    }
  }
}
