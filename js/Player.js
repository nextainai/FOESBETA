import { CONFIG } from "./config.js";

export default class Player {
  constructor(camera, input) {
    this.camera = camera;
    this.input = input;
    this.health = CONFIG.maxHealth;
  }

  update() {
    if (this.input.keys["w"]) this.camera.position.z -= CONFIG.speed;
    if (this.input.keys["s"]) this.camera.position.z += CONFIG.speed;
    if (this.input.keys["a"]) this.camera.position.x -= CONFIG.speed;
    if (this.input.keys["d"]) this.camera.position.x += CONFIG.speed;
  }
}
