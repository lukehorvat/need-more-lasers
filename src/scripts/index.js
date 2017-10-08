import * as THREE from "three";
import WindowResize from "three-window-resize";
import each from "promise-each";
import random from "lodash.random";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import Ship from "./ship";

const modelFilenames = [Ship.modelName];
const modelCache = new ModelCache("models");

let renderer, camera, scene, ambientLight, shipLight, ship, particles, t;

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
    ship.rotation.y = THREE.Math.degToRad(180);
    scene.add(ship);

    particles = new THREE.Group();
    scene.add(particles);

    window.addEventListener("keydown", event => {
      switch (event.key) {
        case " ":
          console.log("Shoot!");
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
  ship.position.z += 1;

  shipLight.position.x = ship.bbox.getCenter().x;
  shipLight.position.y = ship.bbox.max.y + 300;
  shipLight.position.z = ship.bbox.min.z - 80;
  shipLight.target = ship;

  camera.position.x = ship.bbox.getCenter().x;
  camera.position.y = ship.bbox.max.y + 10;
  camera.position.z = ship.bbox.min.z - 10;
  camera.lookAt(new THREE.Vector3(ship.bbox.getCenter().x, ship.bbox.getCenter().y, ship.bbox.max.z + 15));

  particles.position.x = ship.bbox.getCenter().x;
  particles.position.y = ship.bbox.getCenter().y;
  particles.position.z = ship.bbox.max.z + 100;
  Array.from(particles.children).forEach(particle => {
    if (particle.getWorldPosition().z > camera.position.z) {
      particle.position.z -= 1;
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

  t++;

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
