import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import SoundCache from "./sound-cache";
import FontCache from "./font-cache";
import Mouse from "./mouse";
import Keyboard from "./keyboard";
import GameObject from "./game-object";
import Time from "./time";
import Score from "./score";
import Reticule from "./reticule";
import Player from "./player";
import Laser from "./laser";
import SlowLaser from "./slow-laser";
import FastLaser from "./fast-laser";
import Enemy from "./enemy";
import SlowEnemy from "./slow-enemy";
import FastEnemy from "./fast-enemy";
import PowerUp from "./power-up";
import Explosion from "./explosion";
import Particle from "./particle";
import EndMessage from "./end-message";

export default class Game {
  static startSoundName = "start.ogg";
  static endSoundName = "end.ogg";

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
        SlowLaser.modelName,
        FastLaser.modelName,
        SlowEnemy.modelName,
        FastEnemy.modelName,
        PowerUp.modelName,
        Explosion.modelName,
        Particle.modelName,
      ])
    )).then(() => (
      this.sounds.init([
        Game.startSoundName,
        Game.endSoundName,
        SlowLaser.soundName,
        FastLaser.soundName,
        ...Enemy.killSoundNames,
        PowerUp.acquireSoundName,
        PowerUp.enableSoundName,
        Explosion.soundName,
      ])
    )).then(() => (
      this.fonts.init([
        Time.fontName,
        Score.fontName,
        EndMessage.fontName,
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

    this.time = new Time(this, 0);
    this.time.position.copy(this.camera.position).add(new THREE.Vector3(0, 2, -3)); // TODO: Compute position from visible rectangle at this depth.
    this.scene.add(this.time);

    this.score = new Score(this, 0);
    this.score.position.copy(this.camera.position).add(new THREE.Vector3(0, -2, -3)); // TODO: Compute position from visible rectangle at this depth.
    this.scene.add(this.score);

    this.reticule = new Reticule(this, 0);
    this.scene.add(this.reticule);

    this.player = new Player(this, 0);
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

    if (this.time.remainingSeconds > 0) {
      // Update all existing objects.
      this.objects.forEach(object => object.update(elapsedTime, delta));

      // Spawn a new enemy?
      if (!this.enemies.length || elapsedTime - this.enemies.pop().createdAt > 1) {
        let enemy = new (random(0, 100) > 20 ? SlowEnemy : FastEnemy)(this, elapsedTime);
        enemy.position.copy(new THREE.Vector3(this.camera.position.x + random(-500, 500), this.camera.position.y + random(-200, 200), this.camera.position.z - this.camera.far));
        enemy.lookAt(new THREE.Vector3(random(-500, 500), random(-200, 200), this.camera.position.z));
        this.scene.add(enemy);
      }

      // Spawn a new power-up?
      if (!this.powerUps.length && !this.player.poweredUp && elapsedTime > 60) {
        let powerUp = new PowerUp(this, elapsedTime);
        powerUp.position.copy(new THREE.Vector3(this.camera.position.x + random(-500, 500), this.camera.position.y + random(-200, 200), this.camera.position.z - this.camera.far));
        powerUp.lookAt(new THREE.Vector3(random(-500, 500), random(-200, 200), this.camera.position.z));
        this.scene.add(powerUp);
      }

      // Spawn a new particle?
      if (!this.particles.length || elapsedTime - this.particles.pop().createdAt > 0.01) {
        let particle = new Particle(this, elapsedTime);
        particle.position.copy(new THREE.Vector3(this.camera.position.x + random(-30, 30), this.camera.position.y + random(-20, 20), this.camera.position.z - 50));
        this.scene.add(particle);
      }

      // Queue up the next update.
      requestAnimationFrame(::this.update);
    } else {
      let endMessage = new EndMessage(this, elapsedTime);
      endMessage.position.copy(this.camera.position).add(new THREE.Vector3(0, 0, -3));
      this.scene.add(endMessage);
      this.scene.remove(this.time);
      this.domElement.style.cursor = null;

      setTimeout(() => this.sounds.get(Game.endSoundName).play({ volume: 80 }), 1500);
    }

    // Render the scene!
    this.renderer.render(this.scene, this.camera);
  }

  get objects() {
    return this.scene.children.filter(child => child instanceof GameObject);
  }

  get lasers() {
    return this.objects.filter(child => child instanceof Laser);
  }

  get enemies() {
    return this.objects.filter(child => child instanceof Enemy);
  }

  get powerUps() {
    return this.objects.filter(child => child instanceof PowerUp);
  }

  get explosions() {
    return this.objects.filter(child => child instanceof Explosion);
  }

  get particles() {
    return this.objects.filter(child => child instanceof Particle);
  }
}
