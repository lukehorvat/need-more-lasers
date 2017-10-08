import * as THREE from "three";
import WindowResize from "three-window-resize";
import each from "promise-each";
import * as ThreeExtensions from "./three";
import ModelCache from "./model-cache";
import Ship from "./ship";

const modelFilenames = [Ship.modelName];
const modelCache = new ModelCache("models");

let renderer, camera, scene, ambientLight, shipLight, ship;

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

    ambientLight = new THREE.AmbientLight("#aaaaaa");
    scene.add(ambientLight);

    shipLight = new THREE.SpotLight("#aaaaaa");
    scene.add(shipLight);

    ship = new Ship(modelCache);
    ship.position.x = 0;
    ship.position.y = 0;
    ship.position.z = 0;
    ship.rotation.y = THREE.Math.degToRad(180);
    scene.add(ship);
  });
}

function render() {
  // ship.position.z -= 1;

  camera.position.x = ship.bbox.getCenter().x;
  camera.position.y = ship.bbox.max.y + 8;
  camera.position.z = ship.bbox.min.z - 6;
  camera.lookAt(new THREE.Vector3(ship.bbox.getCenter().x, ship.bbox.getCenter().y, ship.bbox.max.z));

  shipLight.position.x = ship.bbox.getCenter().x;
  shipLight.position.y = ship.bbox.max.y + 300;
  shipLight.position.z = ship.bbox.min.z - 80;
  shipLight.lookAt(ship.bbox.getCenter());

  // Render the scene!
  renderer.render(scene, camera);

  // Queue up the next render.
  requestAnimationFrame(render);
}
