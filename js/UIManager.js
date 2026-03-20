export default class UIManager {
  constructor() {
    this.crosshair = document.getElementById("crosshair");
  }

  hitMarker() {
    this.crosshair.style.background = "red";
    setTimeout(() => {
      this.crosshair.style.background = "transparent";
    }, 100);
  }

  update(player, weapon) {
    document.getElementById("health").innerText = "HP: " + player.health;
    document.getElementById("ammo").innerText = "Ammo: " + weapon.ammo;
  }
}
