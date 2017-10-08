import * as THREE from "three";
import WindowResize from "three-window-resize";
import each from "promise-each";
import random from "lodash.random";
import moment from "moment";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import * as sounds from "./sounds";
import Ship from "./ship";
import Laser from "./laser";

const modelFilenames = [Ship.modelName];
const modelCache = new ModelCache("models");

let audioCtx, renderer, camera, scene, ambientLight, shipLight, ship, particles, t;

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

    shipLight = new THREE.SpotLight("#aaaaaa");
    scene.add(shipLight);

    ship = new Ship(modelCache);
    scene.add(ship);

    particles = new THREE.Group();
    scene.add(particles);

    window.addEventListener("keydown", event => {
      switch (event.key) {
        case " ":
          Laser.canSpawn = !Laser.lastSpawnTime || moment().diff(Laser.lastSpawnTime, "milliseconds") > 200;
          break;
        case "ArrowLeft":
          console.log("left");
          break;
        case "ArrowRight":
          console.log("right");
          break;
      }
    }, false);

    t = 0;
  });
}

function render() {
  scene.children.filter(child => child.update).forEach(child => child.update());

  shipLight.position.x = ship.bbox.getCenter().x;
  shipLight.position.y = ship.bbox.max.y + 300;
  shipLight.position.z = ship.bbox.max.z + 80;
  shipLight.target = ship;

  camera.position.x = ship.bbox.getCenter().x;
  camera.position.y = ship.bbox.max.y + 12;
  camera.position.z = ship.bbox.max.z + 10;
  camera.lookAt(new THREE.Vector3(ship.bbox.getCenter().x, ship.bbox.getCenter().y, ship.bbox.min.z - 15));

  particles.position.x = ship.bbox.getCenter().x;
  particles.position.y = ship.bbox.getCenter().y;
  particles.position.z = ship.bbox.min.z - 100;
  Array.from(particles.children).forEach(particle => {
    if (particle.getWorldPosition().z < camera.position.z) {
      particle.position.z += 1;
    } else {
      particles.remove(particle);
    }
  });

  if (t % 2 === 0) {
    let particle = new THREE.Mesh();
    particle.material = new THREE.MeshToonMaterial({ color: "#dddddd", transparent: true, opacity: 0.5 });
    particle.geometry = new THREE.SphereGeometry(0.1, 3, 2);
    particle.position.x = random(-50, 50);
    particle.position.y = random(-10, 20);
    particle.position.z = 0;
    particles.add(particle);
  }

  if (Laser.canSpawn) {
    let laser1 = new Laser();
    laser1.position.x = ship.bbox.min.x + 0.8;
    laser1.position.y = ship.bbox.getCenter().y - 1;
    laser1.position.z = ship.bbox.min.z - Math.abs(laser1.position.z - laser1.bbox.min.z) + 4.5;
    scene.add(laser1);

    let laser2 = laser1.clone();
    laser2.position.x = ship.bbox.max.x - 0.8;
    scene.add(laser2);

    sounds.laser(audioCtx);

    Laser.canSpawn = false;
    Laser.lastSpawnTime = moment();
  }

  t++;

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
