export default class Weapon {
  constructor(type) {
    this.type = type;

    if (type === "rifle") {
      this.ammo = 30;
      this.damage = 10;
      this.fireRate = 100;
      this.recoil = 0.02;
    } else {
      this.ammo = 12;
      this.damage = 20;
      this.fireRate = 400;
      this.recoil = 0.05;
    }

    this.lastShot = 0;
  }

  canShoot() {
    return Date.now() - this.lastShot > this.fireRate;
  }

  shoot(camera) {
    if (this.ammo <= 0 || !this.canShoot()) return false;

    this.lastShot = Date.now();
    this.ammo--;

    // recoil
    camera.rotation.x -= this.recoil;

    return true;
  }

  reload() {
    this.ammo = this.type === "rifle" ? 30 : 12;
  }
}
