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
import Laser from "./laser";
import Enemy from "./enemy";
import SlowEnemy from "./slow-enemy";
import FastEnemy from "./fast-enemy";
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
        Laser.modelName,
        SlowEnemy.modelName,
        FastEnemy.modelName,
        Particle.modelName,
      ])
    )).then(() => (
      this.sounds.init([
        Laser.fireSoundName,
        Enemy.explosionSoundName,
      ])
    )).then(() => (
      this.fonts.init([
        KillCounter.fontName,
      ])
    )).then(() => {
      ThreeExtensions.install();
    });
  }

  start() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.domElement.style.cursor = "none";
    this.domElement.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(80, this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight, 1, Number.MAX_SAFE_INTEGER);

    WindowResize(this.renderer, this.camera); // Automatically handle window resize events.

    this.mouse = new Mouse(this.renderer, this.camera);

    this.keyboard = new Keyboard();

    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();

    this.reticule = new Reticule(this);
    this.reticule.spawn();

    this.killCounter = new KillCounter(this);
    this.killCounter.position.copy(this.camera.position).add(new THREE.Vector3(0, -2, -3));
    this.killCounter.spawn(); // TODO: compute position from visible rectangle at this depth.

    this.leftGun = new Gun(this);
    this.leftGun.position.copy(this.camera.position).add(new THREE.Vector3(-6, 0, 0));
    this.leftGun.spawn();

    this.rightGun = new Gun(this);
    this.rightGun.position.copy(this.camera.position).add(new THREE.Vector3(6, 0, 0));
    this.rightGun.spawn();

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

    this.update();
  }

  update() {
    let delta = this.clock.getDelta();
    let elapsedTime = this.clock.getElapsedTime();
    let objects = [this.reticule, this.leftGun, this.rightGun, ...this.lasers, ...this.enemies, ...this.particles];

    objects.forEach(object => object.update(elapsedTime, delta));

    if (this.keyboard.space && (!this.lasers.length || elapsedTime - this.lasers.pop().spawnedAt > 0.2)) {
      let laser1 = new Laser(this);
      laser1.position.copy(this.leftGun.localToWorld(this.leftGun.frontPosition.clone()));
      laser1.spawn(elapsedTime);

      let laser2 = new Laser(this);
      laser2.position.copy(this.rightGun.localToWorld(this.rightGun.frontPosition.clone()));
      laser2.spawn(elapsedTime);

      this.sounds.get(Laser.fireSoundName).play({ volume: 100 });
    }

    if (!this.enemies.length || elapsedTime - this.enemies.pop().spawnedAt > 1) {
      let enemy = new (random(0, 100) > 20 ? SlowEnemy : FastEnemy)(this);
      enemy.position.copy(new THREE.Vector3(this.camera.position.x + random(-500, 500), this.camera.position.y + random(-200, 200), this.maxWorldDepth));
      enemy.spawn(elapsedTime);
    }

    if (!this.particles.length || elapsedTime - this.particles.pop().spawnedAt > 0.01) {
      let particle = new Particle(this);
      particle.position.copy(new THREE.Vector3(this.camera.position.x + random(-30, 30), this.camera.position.y + random(-20, 20), this.camera.position.z - 50));
      particle.spawn(elapsedTime);
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
    return this.scene.children.filter(child => child instanceof Enemy);
  }

  get particles() {
    return this.scene.children.filter(child => child instanceof Particle);
  }

  get maxWorldDepth() {
    return this.camera.position.z - Laser.range;
  }
}
