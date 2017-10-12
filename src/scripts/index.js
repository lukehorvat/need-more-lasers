import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import * as sounds from "./sounds";
import Mouse from "./mouse";
import Keyboard from "./keyboard";
import Reticule from "./reticule";
import Gun from "./gun";
import Enemy from "./enemy";
import Laser from "./laser";
import Particle from "./particle";

let audioCtx;
let renderer;
let camera;
let mouse;
let keyboard;
let scene;
let clock;

init().then(render);

function init() {
  return ModelCache.init([
    Reticule.modelName,
    Gun.modelName,
    Enemy.modelName,
    Laser.modelName
  ]).then(() => {
    ThreeExtensions.install();

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(80, renderer.domElement.clientWidth / renderer.domElement.clientHeight, 1, Number.MAX_SAFE_INTEGER);

    WindowResize(renderer, camera); // Automatically handle window resize events.

    mouse = new Mouse(renderer, camera);
    mouse.x = 0;
    mouse.y = -0.1;

    keyboard = new Keyboard();

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    let reticule = new Reticule();
    scene.add(reticule);

    let leftGun = new Gun();
    leftGun.position.copy(camera.position).add(new THREE.Vector3(-6, 0, 0));
    scene.add(leftGun);

    let rightGun = new Gun();
    rightGun.position.copy(camera.position).add(new THREE.Vector3(6, 0, 0));
    scene.add(rightGun);

    let leftGunLight = new THREE.SpotLight("#999999");
    leftGunLight.position.copy(leftGun.position).add(new THREE.Vector3(400, 100, 0));
    leftGunLight.target = leftGun;
    scene.add(leftGunLight);

    let rightGunLight = new THREE.SpotLight("#999999");
    rightGunLight.position.copy(rightGun.position).add(new THREE.Vector3(-400, -100, 0));
    rightGunLight.target = rightGun;
    scene.add(rightGunLight);

    let ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);
  });
}

function render() {
  let delta = clock.getDelta();
  let elapsedTime = clock.getElapsedTime();
  let reticule = scene.children.find(child => child instanceof Reticule);
  let [leftGun, rightGun] = scene.children.filter(child => child instanceof Gun);
  let enemies = scene.children.filter(child => child instanceof Enemy);
  let lasers = scene.children.filter(child => child instanceof Laser);
  let particles = scene.children.filter(child => child instanceof Particle);
  let maxWorldDepth = camera.position.z - Laser.range;

  reticule.position.copy(mouse.getPosition(camera.position.z - 10));
  reticule.lookAt(camera.position);

  leftGun.lookAt(mouse.getPosition(maxWorldDepth));
  rightGun.rotation.copy(leftGun.rotation);

  enemies.forEach(enemy => {
    if (enemy.getWorldPosition().z < camera.position.z) {
      enemy.position.addScaledVector(enemy.getWorldDirection(), enemy.speed * delta);
    } else {
      scene.remove(enemy);
    }
  });

  lasers.forEach(laser => {
    if (laser.getWorldPosition().z > maxWorldDepth) {
      laser.position.addScaledVector(laser.getWorldDirection(), laser.speed * delta);

      let enemy = enemies.find(enemy => enemy.bbox.containsPoint(laser.localToWorld(laser.frontPosition.clone())));
      if (enemy) {
        scene.remove(laser, enemy);
        sounds.explosion(audioCtx);
      }
    } else {
      scene.remove(laser);
    }
  });

  particles.forEach(particle => {
    if (particle.getWorldPosition().z < camera.position.z) {
      particle.position.z += particle.speed * delta;
      particle.rotation.z += THREE.Math.degToRad(360) * delta;
    } else {
      scene.remove(particle);
    }
  });

  if (!enemies.length || elapsedTime - enemies.pop().spawnedAt > 1) {
    let enemy = new Enemy();
    enemy.position.x = camera.position.x + random(-400, 400);
    enemy.position.y = camera.position.y + random(-100, 100);
    enemy.position.z = maxWorldDepth;
    enemy.lookAt(new THREE.Vector3(random(-400, 400), random(-100, 100), camera.position.z));
    enemy.spawnedAt = elapsedTime;
    scene.add(enemy);
  }

  let particle = new Particle();
  particle.position.x = camera.position.x + random(-30, 30);
  particle.position.y = camera.position.y + random(-20, 20);
  particle.position.z = camera.position.z - 50;
  scene.add(particle);

  if (keyboard.space && (!lasers.length || elapsedTime - lasers.pop().spawnedAt > 0.2)) {
    let laser1 = new Laser();
    laser1.position.copy(leftGun.localToWorld(leftGun.frontPosition.clone()));
    laser1.lookAt(mouse.getPosition(maxWorldDepth));

    let laser2 = new Laser();
    laser2.position.copy(rightGun.localToWorld(rightGun.frontPosition.clone()));
    laser2.rotation.copy(laser1.rotation);

    laser1.spawnedAt = laser2.spawnedAt = elapsedTime;
    scene.add(laser1, laser2);
    sounds.laser(audioCtx);
  }

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
