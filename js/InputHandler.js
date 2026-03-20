export default class InputHandler {
  constructor(camera) {
    this.keys = {};
    this.camera = camera;
    this.pitch = 0;
    this.yaw = 0;

    document.addEventListener("keydown", e => this.keys[e.key] = true);
    document.addEventListener("keyup", e => this.keys[e.key] = false);

    document.body.addEventListener("click", () => {
      document.body.requestPointerLock();
    });

    document.addEventListener("mousemove", e => {
      if (document.pointerLockElement === document.body) {
        this.yaw -= e.movementX * 0.002;
        this.pitch -= e.movementY * 0.002;

        this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));

        camera.rotation.set(this.pitch, this.yaw, 0);
      }
    });
  }
}
