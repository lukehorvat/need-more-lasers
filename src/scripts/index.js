import * as THREE from "three";
import WindowResize from "three-window-resize";
import random from "lodash.random";
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
    Turret.modelName,
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

    let turret = new Turret();
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
  let elapsedTime = clock.getElapsedTime();
  let reticule = scene.children.find(child => child instanceof Reticule);
  let turret = scene.children.find(child => child instanceof Turret);
  let enemies = scene.children.filter(child => child instanceof Enemy);
  let lasers = scene.children.filter(child => child instanceof Laser);
  let particles = scene.children.filter(child => child instanceof Particle);
  let maxWorldDepth = turret.bbox.min.z - Laser.range;

  reticule.position.copy(mouse.getPosition(camera.position.z - 10));
  reticule.lookAt(camera.position);
  reticule.line.geometry.vertices[0] = reticule.worldToLocal(turret.position.clone());
  reticule.line.geometry.vertices[1] = reticule.worldToLocal(mouse.getPosition(maxWorldDepth));
  reticule.line.geometry.verticesNeedUpdate = true;

  turret.lookAt(mouse.getPosition(maxWorldDepth));

  enemies.forEach(enemy => {
    if (enemy.getWorldPosition().z < camera.position.z) {
      enemy.position.addScaledVector(enemy.getWorldDirection(), enemy.speed * delta);
    } else {
      scene.remove(enemy);
    }
  });

  lasers.forEach(laser => {
    if (laser.getWorldPosition().z > turret.bbox.min.z - 2000) {
      laser.position.addScaledVector(laser.getWorldDirection(), laser.speed * delta);
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

  if (random(0, 100) < 12) {
    let enemy = new Enemy();
    enemy.position.x = camera.position.x + random(-400, 400);
    enemy.position.y = camera.position.y + random(-100, 100);
    enemy.position.z = maxWorldDepth;
    enemy.lookAt(new THREE.Vector3(random(-400, 400), random(-100, 100), camera.position.z));
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

  if (keyboard.space && (!lasers.length || elapsedTime - lasers.pop().spawnedAt > 0.3)) {
    let laser1 = new Laser();
    laser1.position.copy(turret.localToWorld(turret.leftGunPosition));
    laser1.rotation.copy(turret.rotation);
    laser1.spawnedAt = elapsedTime;
    scene.add(laser1);

    let laser2 = new Laser();
    laser2.position.copy(turret.localToWorld(turret.rightGunPosition));
    laser2.rotation.copy(turret.rotation);
    laser2.spawnedAt = elapsedTime;
    scene.add(laser2);

    sounds.laser(audioCtx);
  }

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
