import Game from "./Game.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gameCanvas")
});

renderer.setSize(window.innerWidth, window.innerHeight);

const game = new Game(scene, camera);

function animate() {
  requestAnimationFrame(animate);
  game.update();
  renderer.render(scene, camera);
}

animate();
