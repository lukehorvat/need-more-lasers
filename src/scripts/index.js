import * as THREE from "three";
import WindowResize from "three-window-resize";
import each from "promise-each";
import random from "lodash.random";
import moment from "moment";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import * as sounds from "./sounds";
import Mouse from "./mouse";
import Keyboard from "./keyboard";
import Reticule from "./reticule";
import Turret from "./turret";
import Enemy from "./enemy";
import Laser from "./laser";
import Particle from "./particle";

let modelFilenames = [Reticule.modelName, Turret.modelName, Enemy.modelName, Laser.modelName];
let modelCache = new ModelCache("models");
let audioCtx;
let renderer;
let camera;
let mouse;
let keyboard;
let scene;
let clock;

init().then(render);

function init() {
  return Promise
  .resolve()
  .then(() => (
    Promise.resolve(modelFilenames).then(each(modelFilename => (
      modelCache.set(modelFilename)
    )))
  ))
  .then(() => {
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

    let reticule = new Reticule(modelCache);
    scene.add(reticule);

    let turret = new Turret(modelCache);
    turret.position.y = -25; // TODO: Should calculate y based on width of visible rectangle at turret.position.z.
    turret.position.z = -50;
    scene.add(turret);

    let spotLight = new THREE.SpotLight("#aaaaaa");
    spotLight.position.x = turret.bbox.getCenter().x;
    spotLight.position.y = turret.bbox.max.y + 1000;
    spotLight.position.z = turret.bbox.getCenter().z;
    spotLight.decay = 0;
    spotLight.angle = THREE.Math.degToRad(90);
    spotLight.target = turret;
    scene.add(spotLight);

    let ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);
  });
}

function render() {
  let delta = clock.getDelta();
  let reticule = scene.children.find(child => child instanceof Reticule);
  let turret = scene.children.find(child => child instanceof Turret);
  let enemies = scene.children.filter(child => child instanceof Enemy);
  let lasers = scene.children.filter(child => child instanceof Laser);
  let particles = scene.children.filter(child => child instanceof Particle);

  reticule.position.copy(mouse.getPosition(turret.bbox.min.z - 1000));
  reticule.lookAt(turret.bbox.getCenter());

  turret.lookAt(reticule.position);

  enemies.forEach(enemy => {
    if (enemy.getWorldPosition().z < camera.position.z) {
      enemy.position.z += enemy.speed * delta;
    } else {
      scene.remove(enemy);
    }
  });

  lasers.forEach(laser => {
    if (laser.getWorldPosition().z > turret.bbox.min.z - 2000) {
      laser.position.addScaledVector(laser.direction, laser.speed * delta);
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

  if (random(0, 100) < 8) {
    let enemy = new Enemy(modelCache);
    enemy.position.x = camera.position.x + random(-400, 400);
    enemy.position.y = camera.position.y + random(-100, 100);
    enemy.position.z = turret.bbox.min.z - 2000;
    scene.add(enemy);
  }

  let particle = new Particle();
  particle.position.x = camera.position.x + random(-100, 100);
  particle.position.y = camera.position.y + random(-20, 20);
  particle.position.z = turret.bbox.min.z - 10;
  scene.add(particle);

  if ((keyboard.a || keyboard.left) && turret.position.x > -50) {
    turret.position.x -= turret.speed * delta;
  }

  if ((keyboard.d || keyboard.right) && turret.position.x < 50) {
    turret.position.x += turret.speed * delta;
  }

  if (keyboard.space && (!Laser.lastSpawnTime || moment().diff(Laser.lastSpawnTime, "milliseconds") > 250)) {
    let laser1 = new Laser(modelCache);
    laser1.position.copy(turret.localToWorld(turret.leftGunPosition));
    laser1.direction = reticule.bbox.getCenter().sub(laser1.position).normalize();
    laser1.lookAt(reticule.bbox.getCenter());
    scene.add(laser1);

    let laser2 = new Laser(modelCache);
    laser2.position.copy(turret.localToWorld(turret.rightGunPosition));
    laser2.direction = reticule.bbox.getCenter().sub(laser2.position).normalize();
    laser2.lookAt(reticule.bbox.getCenter());
    scene.add(laser2);

    sounds.laser(audioCtx);

    Laser.lastSpawnTime = moment();
  }

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
