import * as THREE from "three";
import WindowResize from "three-window-resize";
import each from "promise-each";
import random from "lodash.random";
import moment from "moment";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import * as sounds from "./sounds";
import Turret from "./turret";
import Laser from "./laser";

const modelFilenames = [Turret.modelName];
const modelCache = new ModelCache("models");

let audioCtx;
let renderer;
let camera;
let scene;
let ambientLight;
let turret;
let turretLight;
let particles;
let mouse;
let keyboard;
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

    scene = new THREE.Scene();

    ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);

    turret = new Turret(modelCache);
    turret.position.y = -25;
    turret.position.z = -50;
    scene.add(turret);

    turretLight = new THREE.SpotLight("#aaaaaa");
    turretLight.position.x = turret.bbox.getCenter().x;
    turretLight.position.y = turret.bbox.max.y + 300;
    turretLight.position.z = turret.bbox.getCenter().z;
    turretLight.target = turret;
    scene.add(turretLight);

    particles = new THREE.Group();
    scene.add(particles);

    mouse = new THREE.Vector2(0, 0);

    keyboard = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      shift: false,
    };

    window.addEventListener("keydown", event => {
      switch (event.key) {
        case "Shift":
          keyboard.shift = true;
          break;
        case " ":
          keyboard.space = true;
          break;
        case "w":
        case "ArrowUp":
          keyboard.w = true;
          break;
        case "a":
        case "ArrowLeft":
          keyboard.a = true;
          break;
        case "s":
        case "ArrowDown":
          keyboard.s = true;
          break;
        case "d":
        case "ArrowRight":
          keyboard.d = true;
          break;
      }
    }, false);

    window.addEventListener("keyup", event => {
      switch (event.key) {
        case "Shift":
          keyboard.shift = false;
          break;
        case " ":
          keyboard.space = false;
          break;
        case "w":
        case "ArrowUp":
          keyboard.w = false;
          break;
        case "a":
        case "ArrowLeft":
          keyboard.a = false;
          break;
        case "s":
        case "ArrowDown":
          keyboard.s = false;
          break;
        case "d":
        case "ArrowRight":
          keyboard.d = false;
          break;
      }
    }, false);

    window.addEventListener("mousemove", event => {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    }, false);

    t = 0;
  });
}

function render() {
  scene.children.filter(child => child.update).forEach(child => child.update());

  let mousePosition = camera.mouseToWorldPosition(mouse.x, mouse.y, -1000);
  turret.lookAt(mousePosition);

  particles.position.x = camera.position.x;
  particles.position.y = camera.position.y;
  particles.position.z = camera.position.z - 200;
  Array.from(particles.children).forEach(particle => {
    if (particle.getWorldPosition().z < camera.position.z) {
      particle.position.z += 1;
    } else {
      particles.remove(particle);
    }
  });

  let particle = new THREE.Mesh();
  particle.material = new THREE.MeshToonMaterial({ color: "#dddddd", transparent: true, opacity: 0.5, });
  particle.geometry = new THREE.SphereGeometry(0.1, 3, 2);
  particle.position.x = random(-100, 100);
  particle.position.y = random(-20, 20);
  particle.position.z = 0;
  particles.add(particle);

  if (keyboard.w && turret.position.y < 25) {
    // turret.position.y += 1;
  }

  if (keyboard.a && turret.position.x > -50) {
    turret.position.x -= 4;
  }

  if (keyboard.s && turret.position.y > -25) {
    // turret.position.y -= 1;
  }

  if (keyboard.d && turret.position.x < 50) {
    turret.position.x += 4;
  }

  if (keyboard.space && (!Laser.lastSpawnTime || moment().diff(Laser.lastSpawnTime, "milliseconds") > 200)) {
    let laser1 = new Laser();
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
