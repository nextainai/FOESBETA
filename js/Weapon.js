export default class Weapon {
  constructor(type) {
    this.type = type;

    if (type === "rifle") {
      this.ammo = 30;
      this.damage = 10;
    } else {
      this.ammo = 12;
      this.damage = 20;
    }
  }

  shoot() {
    if (this.ammo > 0) {
      this.ammo--;
      return true;
    }
    return false;
  }

  reload() {
    this.ammo = this.type === "rifle" ? 30 : 12;
  }
}
