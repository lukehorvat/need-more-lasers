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
import Laser from "./laser";
import Enemy from "./enemy";
import SlowEnemy from "./slow-enemy";
import FastEnemy from "./fast-enemy";
import Explosion from "./explosion";
import Particle from "./particle";

export default class Game {
  static startSoundName = "start.ogg";
  static complimentSoundNames = [
    "congratulations.ogg",
    "eliminated.ogg",
    "fantastic.ogg",
    "flawless.ogg",
    "perfect.ogg",
    "target-destroyed.ogg",
    "target-eliminated.ogg",
    "well-done.ogg",
  ];

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
        Laser.modelName,
        SlowEnemy.modelName,
        FastEnemy.modelName,
        Explosion.modelName,
        Particle.modelName,
      ])
    )).then(() => (
      this.sounds.init([
        Game.startSoundName,
        ...Game.complimentSoundNames,
        Laser.fireSoundName,
        Explosion.soundName,
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

    this.camera = new THREE.PerspectiveCamera(80, this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight, 1, 2000);

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

    this.light1 = new THREE.AmbientLight("#ffffff");
    this.scene.add(this.light1);

    this.light2 = new THREE.SpotLight("#999999");
    this.light2.position.copy(this.player.position).add(new THREE.Vector3(800, 500, 1000));
    this.light2.angle = THREE.Math.degToRad(90);
    this.scene.add(this.light2);

    this.light3 = new THREE.SpotLight("#999999");
    this.light3.position.copy(this.player.position).add(new THREE.Vector3(-800, -500, 1000));
    this.light3.angle = THREE.Math.degToRad(90);
    this.scene.add(this.light3);

    this.sounds.get(Game.startSoundName).play({ volume: 80 });

    this.update();
  }

  update() {
    let delta = this.clock.getDelta();
    let elapsedTime = this.clock.getElapsedTime();
    let objects = [this.reticule, this.player, ...this.lasers, ...this.enemies, ...this.explosions, ...this.particles];

    objects.forEach(object => object.update(elapsedTime, delta));

    if (!this.enemies.length || elapsedTime - this.enemies.pop().createdAt > 1) {
      let enemy = new (random(0, 100) > 20 ? SlowEnemy : FastEnemy)(this, elapsedTime);
      enemy.position.copy(new THREE.Vector3(this.camera.position.x + random(-500, 500), this.camera.position.y + random(-200, 200), this.camera.position.z - this.camera.far));
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

  get explosions() {
    return this.scene.children.filter(child => child instanceof Explosion);
  }

  get particles() {
    return this.scene.children.filter(child => child instanceof Particle);
  }
}
