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
import Player from "./player";
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
    this.scene.add(this.reticule);

    this.killCounter = new KillCounter(this);
    this.killCounter.position.copy(this.camera.position).add(new THREE.Vector3(0, -2, -3)); // TODO: Compute position from visible rectangle at this depth.
    this.scene.add(this.killCounter);

    this.player = new Player(this);
    this.player.position.copy(this.camera.position);
    this.scene.add(this.player);

    this.leftGunLight = new THREE.SpotLight("#999999");
    this.leftGunLight.position.copy(this.player.leftGun.getWorldPosition()).add(new THREE.Vector3(400, 100, 0));
    this.leftGunLight.target = this.player.leftGun;
    this.scene.add(this.leftGunLight);

    this.rightGunLight = new THREE.SpotLight("#999999");
    this.rightGunLight.position.copy(this.player.rightGun.getWorldPosition()).add(new THREE.Vector3(-400, -100, 0));
    this.rightGunLight.target = this.player.rightGun;
    this.scene.add(this.rightGunLight);

    this.ambientLight = new THREE.AmbientLight("#ffffff");
    this.scene.add(this.ambientLight);

    this.update();
  }

  update() {
    let delta = this.clock.getDelta();
    let elapsedTime = this.clock.getElapsedTime();
    let objects = [this.reticule, this.player, ...this.lasers, ...this.enemies, ...this.particles];

    objects.forEach(object => object.update(elapsedTime, delta));

    if (!this.enemies.length || elapsedTime - this.enemies.pop().createdAt > 1) {
      let enemy = new (random(0, 100) > 20 ? SlowEnemy : FastEnemy)(this, elapsedTime);
      enemy.position.copy(new THREE.Vector3(this.camera.position.x + random(-500, 500), this.camera.position.y + random(-200, 200), this.maxWorldDepth));
      enemy.lookAt(new THREE.Vector3(random(-500, 500), random(-200, 200), this.camera.position.z));
      this.scene.add(enemy);
    }

    if (!this.particles.length || elapsedTime - this.particles.pop().createdAt > 0.01) {
      let particle = new Particle(this, elapsedTime);
      particle.position.copy(new THREE.Vector3(this.camera.position.x + random(-30, 30), this.camera.position.y + random(-20, 20), this.camera.position.z - 50));
      this.scene.add(particle);
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
