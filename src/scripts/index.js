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
import Laser from "./laser";
import Particle from "./particle";

let modelFilenames = [Turret.modelName, Reticule.modelName];
let modelCache = new ModelCache("models");
let audioCtx;
let renderer;
let camera;
let mouse;
let keyboard;
let scene;
let t;

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

    let ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);

    let reticule = new Reticule(modelCache);
    reticule.name = "reticule";
    scene.add(reticule);

    let turret = new Turret(modelCache);
    turret.name = "turret";
    turret.position.y = -25; // TODO: Should calculate y based on width of visible rectangle at turret.position.z.
    turret.position.z = -50;
    scene.add(turret);

    let turretLight = new THREE.SpotLight("#aaaaaa");
    turretLight.position.x = turret.bbox.getCenter().x;
    turretLight.position.y = turret.bbox.max.y + 300;
    turretLight.position.z = turret.bbox.getCenter().z;
    turretLight.target = turret;
    scene.add(turretLight);

    t = 0;
  });
}

function render() {
  let reticule = scene.children.find(child => child.name === "reticule");
  let turret = scene.children.find(child => child.name === "turret");
  let lasers = scene.children.filter(child => child.name === "laser");
  let particles = scene.children.filter(child => child.name === "particle");

  reticule.position.fromArray(mouse.getPosition(turret.bbox.min.z - 50).toArray());
  reticule.lookAt(turret.bbox.getCenter());

  turret.lookAt(reticule.position);

  lasers.forEach(laser => {
    laser.position.z -= 18;
  });

  particles.forEach(particle => {
    if (particle.getWorldPosition().z < camera.position.z) {
      particle.position.z += 0.6;
      particle.rotation.x = THREE.Math.degToRad(10);
    } else {
      scene.remove(particle);
    }
  });

  let particle = new Particle();
  particle.name = "particle";
  particle.position.x = camera.position.x + random(-100, 100);
  particle.position.y = camera.position.y + random(-20, 20);
  particle.position.z = turret.bbox.min.z - 10;
  scene.add(particle);

  if ((keyboard.a || keyboard.left) && turret.position.x > -50) {
    turret.position.x -= 1;
  }

  if ((keyboard.d || keyboard.right) && turret.position.x < 50) {
    turret.position.x += 1;
  }

  if (keyboard.space && (!Laser.lastSpawnTime || moment().diff(Laser.lastSpawnTime, "milliseconds") > 200)) {
    let laser1 = new Laser();
    laser1.name = "laser";
    laser1.position.x = turret.bbox.min.x + 0.8;
    laser1.position.y = turret.bbox.getCenter().y - 1;
    laser1.position.z = turret.bbox.min.z - Math.abs(laser1.position.z - laser1.bbox.min.z) + 4.5;
    scene.add(laser1);

    let laser2 = laser1.clone();
    laser2.position.x = turret.bbox.max.x - 0.8;
    scene.add(laser2);

    sounds.laser(audioCtx);

    Laser.lastSpawnTime = moment();
  }

  t++;

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
