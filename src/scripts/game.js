import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import SoundCache from "./sound-cache";
import FontCache from "./font-cache";
import Mouse from "./mouse";
import Keyboard from "./keyboard";
import Reticule from "./reticule";
import KillCounter from "./kill-counter";
import Gun from "./gun";
import Enemy from "./enemy";
import Enemy2 from "./enemy2";
import Laser from "./laser";
import Particle from "./particle";

export default class Game {
  constructor(domElement, modelsPath, soundsPath, fontsPath) {
    this.domElement = domElement;
    this.models = new ModelCache(modelsPath);
    this.sounds = new SoundCache(soundsPath);
    this.fonts = new FontCache(fontsPath);
  }

  init() {
    return Promise
    .resolve()
    .then(() => (
      this.models.init([
        Reticule.modelName,
        Gun.modelName,
        Enemy.modelName,
        Enemy2.modelName,
        Laser.modelName,
        Particle.modelName,
      ])
    )).then(() => (
      this.sounds.init([
        Enemy.explosionSoundName,
        Laser.fireSoundName,
      ])
    )).then(() => (
      this.fonts.init([
        KillCounter.fontName,
      ])
    )).then(() => {
      ThreeExtensions.install();

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.domElement.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(80, this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight, 1, Number.MAX_SAFE_INTEGER);

      WindowResize(this.renderer, this.camera); // Automatically handle window resize events.

      this.mouse = new Mouse(this.renderer, this.camera);

      this.keyboard = new Keyboard();

      this.scene = new THREE.Scene();

      this.clock = new THREE.Clock();

      this.reticule = new Reticule(this);
      this.scene.add(this.reticule);

      this.killCounter = new KillCounter(this);
      this.killCounter.position.copy(this.camera.position).add(new THREE.Vector3(0, -2, -3)); // TODO: compute position from visible rectangle at this depth.
      this.scene.add(this.killCounter);

      this.leftGun = new Gun(this);
      this.leftGun.position.copy(this.camera.position).add(new THREE.Vector3(-6, 0, 0));
      this.scene.add(this.leftGun);

      this.rightGun = new Gun(this);
      this.rightGun.position.copy(this.camera.position).add(new THREE.Vector3(6, 0, 0));
      this.scene.add(this.rightGun);

      this.leftGunLight = new THREE.SpotLight("#999999");
      this.leftGunLight.position.copy(this.leftGun.position).add(new THREE.Vector3(400, 100, 0));
      this.leftGunLight.target = this.leftGun;
      this.scene.add(this.leftGunLight);

      this.rightGunLight = new THREE.SpotLight("#999999");
      this.rightGunLight.position.copy(this.rightGun.position).add(new THREE.Vector3(-400, -100, 0));
      this.rightGunLight.target = this.rightGun;
      this.scene.add(this.rightGunLight);

      this.ambientLight = new THREE.AmbientLight("#ffffff");
      this.scene.add(this.ambientLight);
    });
  }

  start() {
    this.domElement.style.cursor = "none";
    this.update();
  }

  update() {
    let delta = this.clock.getDelta();
    let elapsedTime = this.clock.getElapsedTime();
    let maxWorldDepth = this.camera.position.z - Laser.range;

    this.reticule.position.copy(this.mouse.getPosition(this.camera.position.z - 10));
    this.reticule.lookAt(this.camera.position);

    this.leftGun.lookAt(this.mouse.getPosition(maxWorldDepth));
    this.rightGun.rotation.copy(this.leftGun.rotation);

    this.enemies.forEach(enemy => {
      if (enemy.getWorldPosition().z < this.camera.position.z) {
        enemy.position.addScaledVector(enemy.getWorldDirection(), enemy.speed * delta);
      } else {
        this.scene.remove(enemy);
      }
    });

    this.lasers.forEach(laser => {
      if (laser.getWorldPosition().z > maxWorldDepth) {
        laser.position.addScaledVector(laser.getWorldDirection(), laser.speed * delta);

        let enemy = this.enemies.find(enemy => enemy.bbox.containsPoint(laser.localToWorld(laser.frontPosition.clone())));
        if (enemy) {
          this.scene.remove(laser, enemy);
          this.killCounter.increment();
          this.sounds.get(Enemy.explosionSoundName).play({ volume: 20 });
        }
      } else {
        this.scene.remove(laser);
      }
    });

    this.particles.forEach(particle => {
      if (particle.getWorldPosition().z < this.camera.position.z) {
        particle.position.z += particle.speed * delta;
        particle.rotation.z += THREE.Math.degToRad(360) * delta;
      } else {
        this.scene.remove(particle);
      }
    });

    if (!this.enemies.length || elapsedTime - this.enemies.pop().spawnedAt > 1) {
      let enemy = random(0, 100) < 20 ? new Enemy2(this) : new Enemy(this);
      enemy.position.x = this.camera.position.x + random(-500, 500);
      enemy.position.y = this.camera.position.y + random(-200, 200);
      enemy.position.z = maxWorldDepth;
      enemy.lookAt(new THREE.Vector3(random(-500, 500), random(-200, 200), this.camera.position.z));
      enemy.spawnedAt = elapsedTime;
      this.scene.add(enemy);
    }

    let particle = new Particle(this);
    particle.position.x = this.camera.position.x + random(-30, 30);
    particle.position.y = this.camera.position.y + random(-20, 20);
    particle.position.z = this.camera.position.z - 50;
    this.scene.add(particle);

    if (this.keyboard.space && (!this.lasers.length || elapsedTime - this.lasers.pop().spawnedAt > 0.2)) {
      let laser1 = new Laser(this);
      laser1.position.copy(this.leftGun.localToWorld(this.leftGun.frontPosition.clone()));
      laser1.lookAt(this.mouse.getPosition(maxWorldDepth));

      let laser2 = new Laser(this);
      laser2.position.copy(this.rightGun.localToWorld(this.rightGun.frontPosition.clone()));
      laser2.rotation.copy(laser1.rotation);

      laser1.spawnedAt = laser2.spawnedAt = elapsedTime;
      this.scene.add(laser1, laser2);
      this.sounds.get(Laser.fireSoundName).play({ volume: 100 });
    }

    // Render the scene!
    this.renderer.render(this.scene, this.camera);

    // Queue up the next render.
    requestAnimationFrame(::this.update);
  }

  get lasers() {
    return this.scene.children.filter(child => child instanceof Laser);
  }

  get enemies() {
    return this.scene.children.filter(child => child instanceof Enemy || child instanceof Enemy2);
  }

  get particles() {
    return this.scene.children.filter(child => child instanceof Particle);
  }
}
