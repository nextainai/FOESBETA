export default class Weapon {
  constructor(type, camera) {
    this.type = type;
    this.camera = camera;

    this.ammo = type === "rifle" ? 30 : 12;
    this.damage = type === "rifle" ? 10 : 20;

    this.fireRate = type === "rifle" ? 100 : 400;
    this.recoil = type === "rifle" ? 0.02 : 0.05;

    this.lastShot = 0;

    this.createModel();
  }

  createModel() {
    this.gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x22c55e })
    );

    this.gun.position.set(0.5, -0.5, -1);
    this.camera.add(this.gun);
  }

  update(isMoving) {
    // sway
    if (isMoving) {
      this.gun.position.x = 0.5 + Math.sin(Date.now()*0.01)*0.05;
    }
  }

  shoot() {
    if (this.ammo <= 0) return false;
    if (Date.now() - this.lastShot < this.fireRate) return false;

    this.lastShot = Date.now();
    this.ammo--;

    // recoil animation
    this.gun.position.z += 0.2;
    setTimeout(() => {
      this.gun.position.z -= 0.2;
    }, 50);

    this.camera.rotation.x -= this.recoil;

    return true;
  }

  reload() {
    this.ammo = this.type === "rifle" ? 30 : 12;
  }
}
