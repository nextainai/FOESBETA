export default class UIManager {
  update(player, weapon) {
    document.getElementById("health").innerText = "HP: " + player.health;
    document.getElementById("ammo").innerText = "Ammo: " + weapon.ammo;
  }
}
