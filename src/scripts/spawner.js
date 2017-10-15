import * as THREE from "three";
import random from "lodash.random";
import GameObject from "./game-object";
import SlowEnemy from "./slow-enemy";
import FastEnemy from "./fast-enemy";
import PowerUp from "./power-up";
import Particle from "./particle";

export default class Spawner extends GameObject {
  update(elapsedTime, delta) {
    super.update(elapsedTime, delta);

    if (this.canSpawnEnemy(elapsedTime)) this.spawnEnemy(elapsedTime);

    if (this.canSpawnPowerUp(elapsedTime)) this.spawnPowerUp(elapsedTime);

    if (this.canSpawnParticle(elapsedTime)) this.spawnParticle(elapsedTime);
  }

  canSpawnEnemy(elapsedTime) {
    return !this.game.enemies.length || (this.game.enemies.length < 20 && elapsedTime - this.game.enemies.pop().createdAt > 2);
  }

  canSpawnPowerUp(elapsedTime) {
    return !this.game.powerUps.length && !this.game.player.poweredUp && elapsedTime > 60;
  }

  canSpawnParticle(elapsedTime) {
    return !this.game.particles.length || elapsedTime - this.game.particles.pop().createdAt > 0.01;
  }

  spawnEnemy(elapsedTime) {
    let originZ = this.game.camera.position.z - this.game.camera.far - 50;
    let originVisibleRect = this.game.camera.visibleRect(originZ);
    let originX = random(originVisibleRect.min.x, originVisibleRect.max.x);
    let originY = random(originVisibleRect.min.y, originVisibleRect.max.y);
    let destinationZ = this.game.camera.position.z - (this.game.camera.far / 6);
    let destinationVisibleRect = this.game.camera.visibleRect(destinationZ);
    let destinationX = random(destinationVisibleRect.min.x, destinationVisibleRect.max.x);
    let destinationY = random(destinationVisibleRect.min.y, destinationVisibleRect.max.y);
    let enemy = new (random(0, 100) > 25 ? SlowEnemy : FastEnemy)(this.game, elapsedTime);
    enemy.position.copy(new THREE.Vector3(originX, originY, originZ));
    enemy.lookAt(new THREE.Vector3(destinationX, destinationY, destinationZ));
    this.game.scene.add(enemy);
  }

  spawnPowerUp(elapsedTime) {
    let originZ = this.game.camera.position.z - this.game.camera.far - 50;
    let originVisibleRect = this.game.camera.visibleRect(originZ);
    let originX = random(originVisibleRect.min.x, originVisibleRect.max.x);
    let originY = random(originVisibleRect.min.y, originVisibleRect.max.y);
    let destinationZ = this.game.camera.position.z - (this.game.camera.far / 10);
    let destinationVisibleRect = this.game.camera.visibleRect(destinationZ);
    let destinationX = random(destinationVisibleRect.min.x, destinationVisibleRect.max.x);
    let destinationY = random(destinationVisibleRect.min.y, destinationVisibleRect.max.y);
    let powerUp = new PowerUp(this.game, elapsedTime);
    powerUp.position.copy(new THREE.Vector3(originX, originY, originZ));
    powerUp.lookAt(new THREE.Vector3(destinationX, destinationY, destinationZ));
    this.game.scene.add(powerUp);
  }

  spawnParticle(elapsedTime) {
    let originZ = this.game.camera.position.z - (this.game.camera.far / 40);
    let originVisibleRect = this.game.camera.visibleRect(originZ);
    let originX = random(originVisibleRect.min.x, originVisibleRect.max.x) / 2;
    let originY = random(originVisibleRect.min.y, originVisibleRect.max.y) / 2;
    let particle = new Particle(this.game, elapsedTime);
    particle.position.copy(new THREE.Vector3(originX, originY, originZ));
    this.game.scene.add(particle);
  }
}
